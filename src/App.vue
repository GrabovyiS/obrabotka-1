<template>
  <div class="container">
    <div class="top-controls">
      <FileUploader
        @file-selected="onFileSelected"
        @url-selected="onUrlSelected"
      />

      <button
        type="button"
        class="action-btn"
        @click="
          () => {
            showResizeModal = true;
            showGradation = false;
            showFilter = false;
          }
        "
        :disabled="!imageElement"
      >
        Resize
      </button>
      <button
        type="button"
        class="action-btn"
        @click="
          () => {
            showGradation = true;
            showFilter = false;
            showResizeModal = false;
          }
        "
        :disabled="!imageElement"
      >
        Gradation
      </button>
      <button
        type="button"
        class="action-btn"
        @click="
          () => {
            showFilter = true;
            showGradation = false;
            showResizeModal = false;
          }
        "
        :disabled="!imageElement"
      >
        Filter
      </button>
      <button
        type="button"
        :class="['tool-btn', { active: activeTool === TOOLS.HAND }]"
        @click="setTool(TOOLS.HAND)"
        title="Hand Tool (H): Move image"
      >
        Hand
      </button>
      <button
        type="button"
        :class="['tool-btn', { active: activeTool === TOOLS.EYEDROPPER }]"
        @click="setTool(TOOLS.EYEDROPPER)"
        title="Eyedropper Tool (I): Pick color"
      >
        Eyedropper
      </button>
      <button class="save-btn" @click="downloadImage" :disabled="!imageElement">
        Save
      </button>
      <fieldset class="arrow-step-group">
        <legend>Arrow Key Step</legend>
        <label>
          <input
            type="radio"
            name="step"
            value="5"
            v-model.number="arrowStep"
          />
          Slow
        </label>
        <label>
          <input
            type="radio"
            name="step"
            value="20"
            v-model.number="arrowStep"
          />
          Normal
        </label>
        <label>
          <input
            type="radio"
            name="step"
            value="40"
            v-model.number="arrowStep"
          />
          Fast
        </label>
      </fieldset>
    </div>

    <div class="main-panel">
      <CanvasDisplay
        :arrowStep="arrowStep"
        :image="imageElement"
        :scale="scale"
        :activeTool="activeTool"
        @color-pick="handleColorPick"
        @hover-color="onHoverColor"
      />
      <ColorInspector :colors="pickedColors" />
    </div>

    <StatusBar
      :imageMeta="imageMeta"
      :scale="scale"
      :hoverColor="hoverColor"
      :clickColor="clickColor"
      @update:scale="scale = $event"
    />

    <ResizeModal
      :imageMeta="imageMeta"
      :open="showResizeModal"
      @close="showResizeModal = false"
      @confirm="onResizeConfirm"
    />

    <GradationModal
      :open="showGradation"
      :image="originalImage"
      @close="showGradation = false"
      @apply="onGradationApply"
      @preview="onGradationPreview"
    />

    <FilterModal
      :open="showFilter"
      @close="showFilter = false"
      @apply="onFilterApply"
      @preview="onFilterPreview"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import FileUploader from "./components/FileUploader.vue";
import CanvasDisplay from "./components/CanvasDisplay.vue";
import StatusBar from "./components/StatusBar.vue";
import ResizeModal from "./components/ResizeModal.vue";
import ColorInspector from "./components/ColorInspector.vue";
import GradationModal from "./components/GradationModal.vue";
import FilterModal from "./components/FilterModal.vue";

import { parseCustomImage } from "./utils/imageParser";
import {
  nearestNeighborInterpolation,
  bilinearInterpolation,
} from "./utils/interpolation";
import { generateLUT, applyGradation } from "./utils/gradation";
import { applyConvolution } from "./utils/convolution";

const imageElement = ref(null);
const originalImage = ref(null);
const imageMeta = ref(null);
const scale = ref(1.0);

const showResizeModal = ref(false);
const showGradation = ref(false);
const showFilter = ref(false);

const arrowStep = ref(20);

function calculateInitialScale(img) {
  const padding = 50;
  const availableWidth = window.innerWidth - padding * 2;
  const availableHeight = window.innerHeight - padding * 2;
  return Math.min(
    availableWidth / img.width,
    availableHeight / img.height,
    1.0
  );
}

async function onFileSelected({ file, buffer }) {
  const isCustom = file.name.endsWith(".gb7");

  if (isCustom) {
    try {
      if (!buffer || !(buffer instanceof ArrayBuffer)) {
        throw new Error("Invalid buffer received from uploader.");
      }
      const { image, meta } = await parseCustomImage(buffer);
      imageElement.value = image;
      originalImage.value = image;
      imageMeta.value = meta;
      scale.value = calculateInitialScale(image);
    } catch (err) {
      alert(`Failed to load GrayBit-7 image: ${err.message}`);
    }
  } else {
    const image = new Image();
    image.onload = () => {
      imageElement.value = image;
      originalImage.value = image;
      const width = image.width;
      const height = image.height;
      const fileBits = file.size * 8;
      const pixels = width * height;
      const depth = Math.round(fileBits / pixels);
      imageMeta.value = { width, height, colorDepth: depth };
      scale.value = calculateInitialScale(image);
    };
    image.src = URL.createObjectURL(file);
  }
}

function onUrlSelected(url) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    imageElement.value = img;
    originalImage.value = img;
    const width = img.width;
    const height = img.height;
    const pixels = width * height;
    const dummyFileSize = width * height * 3;
    const depth = Math.round((dummyFileSize * 8) / pixels);
    imageMeta.value = { width, height, colorDepth: depth };
    scale.value = calculateInitialScale(img);
  };
  img.onerror = () => alert("Failed to load image from URL.");
  img.src = url;
}

async function onResizeConfirm({ width, height, method }) {
  if (!imageElement.value) return;

  const canvas = document.createElement("canvas");
  canvas.width = imageMeta.value.width;
  canvas.height = imageMeta.value.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imageElement.value, 0, 0);
  const srcData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const resizedData =
    method === "nearest"
      ? nearestNeighborInterpolation(srcData, width, height)
      : bilinearInterpolation(srcData, width, height);

  const outCanvas = document.createElement("canvas");
  outCanvas.width = width;
  outCanvas.height = height;
  outCanvas.getContext("2d").putImageData(resizedData, 0, 0);

  const img = new Image();
  img.src = outCanvas.toDataURL();
  await new Promise((resolve) => (img.onload = resolve));

  imageElement.value = img;
  originalImage.value = img;
  imageMeta.value = { width, height, colorDepth: imageMeta.value.colorDepth };
}

function onGradationApply({ points }) {
  if (!originalImage.value || !imageMeta.value) return;

  const canvas = document.createElement("canvas");
  canvas.width = imageMeta.value.width;
  canvas.height = imageMeta.value.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(originalImage.value, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const lut = generateLUT({
    x1: points[0].x,
    y1: points[0].y,
    x2: points[1].x,
    y2: points[1].y,
  });

  const corrected = applyGradation(imageData, lut);

  ctx.putImageData(corrected, 0, 0);
  const img = new Image();
  img.src = canvas.toDataURL();
  img.onload = () => {
    imageElement.value = img;
    originalImage.value = img;
  };
}

function onGradationPreview({ points, preview }) {
  if (!preview || !originalImage.value || !imageMeta.value) {
    imageElement.value = originalImage.value;
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = imageMeta.value.width;
  canvas.height = imageMeta.value.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(originalImage.value, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const lut = generateLUT({
    x1: points[0].x,
    y1: points[0].y,
    x2: points[1].x,
    y2: points[1].y,
  });

  const corrected = applyGradation(imageData, lut);
  ctx.putImageData(corrected, 0, 0);

  const img = new Image();
  img.src = canvas.toDataURL();
  img.onload = () => {
    imageElement.value = img;
  };
}

function onFilterApply({ kernel }) {
  if (!originalImage.value || !imageMeta.value) return;

  const canvas = document.createElement("canvas");
  canvas.width = imageMeta.value.width;
  canvas.height = imageMeta.value.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(originalImage.value, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const filtered = applyConvolution(imageData, kernel);

  ctx.putImageData(filtered, 0, 0);
  const img = new Image();
  img.src = canvas.toDataURL();
  img.onload = () => {
    imageElement.value = img;
    originalImage.value = img;
  };
}

function onFilterPreview({ kernel, preview }) {
  if (!preview || !originalImage.value || !imageMeta.value) {
    imageElement.value = originalImage.value;
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = imageMeta.value.width;
  canvas.height = imageMeta.value.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(originalImage.value, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const filtered = applyConvolution(imageData, kernel);
  ctx.putImageData(filtered, 0, 0);

  const img = new Image();
  img.src = canvas.toDataURL();
  img.onload = () => {
    imageElement.value = img;
  };
}

const activeTool = ref(null);
const TOOLS = {
  NONE: null,
  HAND: "hand",
  EYEDROPPER: "eyedropper",
};

function setTool(tool) {
  activeTool.value = activeTool.value === tool ? null : tool;
}

window.addEventListener("keydown", (e) => {
  if (e.code === "KeyH") setTool(TOOLS.HAND);
  if (e.code === "KeyI") setTool(TOOLS.EYEDROPPER);
});

const pickedColors = ref({ primary: null, secondary: null });
const clickColor = ref(null);
const hoverColor = ref(null);

function handleColorPick({ x, y, rgba, modifier }) {
  if (activeTool.value === TOOLS.EYEDROPPER) {
    pickedColors.value[modifier] = { x, y, rgba };
  }
  clickColor.value = { x, y, rgba };
}

function onHoverColor(data) {
  hoverColor.value = data;
}

function downloadImage() {
  if (!imageElement.value || !imageMeta.value) return;

  const canvas = document.createElement("canvas");
  canvas.width = imageMeta.value.width;
  canvas.height = imageMeta.value.height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(imageElement.value, 0, 0);

  canvas.toBlob((blob) => {
    if (!blob) return;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "processed-image.png";
    link.click();
    URL.revokeObjectURL(link.href);
  }, "image/png");
}
</script>

<style>
body {
  margin: 0;
}

* {
  font-family: sans-serif;
  box-sizing: border-box;
}

fieldset {
  padding: 5px;
  margin: 0;
}

.container {
  max-width: 100vw;
  overflow: hidden;
}

.top-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 4px;
  background: #f9f9f9;
  border-bottom: 1px solid #ddd;
  z-index: 200;
  position: relative;
}

.action-btn {
  padding: 0.5rem 1rem;
  background: #007acc;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.action-btn:hover {
  background: #005fa3;
}

.top-controls button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
}

.top-controls button:disabled {
  background-color: grey;
  color: white;
}

.save-btn {
  background: #4caf50;
  color: white;
}

.save-btn:hover {
  background: #3e8e41;
}

.top-controls .tool-btn {
  background: #eee;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.tool-btn.active,
.tool-btn:active {
  background: #52a6de;
  color: #fff;
  border-color: #52a6de;
}

.tool-btn:hover {
  background: #ddd;
}

.main-panel {
  display: flex;
  flex-direction: row;
  height: calc(100vh - 70px);
  overflow: hidden;
}

canvas {
  max-width: calc(100% - 250px);
}

.arrow-step-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 1rem;
  font-size: 14px;
}
.arrow-step-group input {
  margin-right: 0.25rem;
}
</style>
