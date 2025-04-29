<template>
  <div class="container">
    <div class="top-controls">
      <FileUploader @file-selected="onFileSelected" />
      <button type="button" @click="showResizeModal = true" class="resize-btn">
        Resize
      </button>
    </div>

    <CanvasDisplay :image="imageElement" :scale="scale" />
    <StatusBar
      :imageMeta="imageMeta"
      :scale="scale"
      @update:scale="scale = $event"
    />

    <ResizeModal
      :imageMeta="imageMeta"
      :open="showResizeModal"
      @close="showResizeModal = false"
      @confirm="onResizeConfirm"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import FileUploader from "./components/FileUploader.vue";
import CanvasDisplay from "./components/CanvasDisplay.vue";
import StatusBar from "./components/StatusBar.vue";
import ResizeModal from "./components/ResizeModal.vue";
import { parseCustomImage } from "./utils/imageParser";
import {
  nearestNeighborInterpolation,
  bilinearInterpolation,
} from "./utils/interpolation";

const imageElement = ref(null);
const imageMeta = ref(null);
const scale = ref(1.0);
const showResizeModal = ref(false);

function calculateInitialScale(img) {
  const padding = 50;
  const availableWidth = window.innerWidth - padding * 2;
  const availableHeight = window.innerHeight - padding * 2;

  const scaleX = availableWidth / img.width;
  const scaleY = availableHeight / img.height;

  return Math.min(scaleX, scaleY, 1.0);
}

async function onFileSelected(file) {
  const isCustom = file.name.endsWith(".gb7");

  if (isCustom) {
    try {
      const { image, meta } = await parseCustomImage(file);
      imageElement.value = image;
      imageMeta.value = meta;
      scale.value = calculateInitialScale(image);
    } catch (err) {
      alert(`Failed to load GrayBit-7 image: ${err.message}`);
    }
  } else {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const width = image.width;
        const height = image.height;
        const pixels = width * height;
        const fileBits = file.size * 8;
        const depth = Math.round(fileBits / pixels);

        imageElement.value = image;
        imageMeta.value = { width, height, colorDepth: depth };
        scale.value = calculateInitialScale(image);
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  }
}

async function onResizeConfirm({ width, height, method }) {
  if (!imageElement.value) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = imageMeta.value.width;
  canvas.height = imageMeta.value.height;
  ctx.drawImage(imageElement.value, 0, 0);

  const srcData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  let resizedData;
  if (method === "nearest") {
    resizedData = nearestNeighborInterpolation(srcData, width, height);
  } else {
    resizedData = bilinearInterpolation(srcData, width, height);
  }

  const outCanvas = document.createElement("canvas");
  outCanvas.width = width;
  outCanvas.height = height;
  outCanvas.getContext("2d").putImageData(resizedData, 0, 0);

  const img = new Image();
  img.src = outCanvas.toDataURL();
  await new Promise((resolve) => (img.onload = resolve));

  imageElement.value = img;
  imageMeta.value = {
    width,
    height,
    colorDepth: imageMeta.value.colorDepth,
  };
}
</script>

<style>
body {
  margin: 0;
}

.container {
  max-width: 100vw;
  overflow: hidden;
  padding-bottom: 3rem; /* Space for fixed status bar */
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

.resize-btn {
  padding: 0.5rem 1rem;
  background: #007acc;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.resize-btn:hover {
  background: #005fa3;
}
</style>
