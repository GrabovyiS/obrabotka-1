<template>
  <canvas
    ref="canvasRef"
    @mousedown="startPan"
    @mouseup="endPan"
    @mouseleave="endPan"
    @mousemove="onMouseMove"
    @click="onCanvasClick"
  ></canvas>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, reactive } from "vue";

const props = defineProps({
  image: Object,
  scale: { type: Number, default: 1.0 },
  activeTool: { type: String, default: null },
});
const emit = defineEmits(["color-pick", "hover-color"]);

const canvasRef = ref(null);
const offset = reactive({ x: 0, y: 0 });
const canvasTranslation = reactive({ x: 0, y: 0 });

let ctx = null;
let dragging = false;
let dragStart = { x: 0, y: 0 };

function handleKeyDown(e) {
  if (props.activeTool !== "hand") return;
  const step = 20;
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
    e.preventDefault();
    if (e.key === "ArrowLeft") canvasTranslation.x += step;
    if (e.key === "ArrowRight") canvasTranslation.x -= step;
    if (e.key === "ArrowUp") canvasTranslation.y += step;
    if (e.key === "ArrowDown") canvasTranslation.y -= step;
    renderImage();
  }
}

function startPan(e) {
  if (props.activeTool !== "hand") return;
  dragging = true;
  dragStart = { x: e.clientX, y: e.clientY };
}

function endPan() {
  dragging = false;
}

function onMouseMove(event) {
  if (dragging && props.activeTool === "hand") {
    const dx = event.clientX - dragStart.x;
    const dy = event.clientY - dragStart.y;
    canvasTranslation.x += dx;
    canvasTranslation.y += dy;
    dragStart = { x: event.clientX, y: event.clientY };
    renderImage();
  }

  const data = getPixelColorAtEvent(event);
  if (data) emit("hover-color", data);
}

function renderImage() {
  const canvas = canvasRef.value;
  if (!canvas || !props.image) return;

  const image = props.image;
  const scale = props.scale;

  const displayWidth = image.width * scale;
  const displayHeight = image.height * scale;

  const workspaceWidth = window.innerWidth;
  const workspaceHeight = window.innerHeight;

  const padding = 50;
  const maxWidth = workspaceWidth - 2 * padding;
  const maxHeight = workspaceHeight - 2 * padding;

  offset.x = canvasTranslation.x + (maxWidth - displayWidth) / 2 + padding;
  offset.y = canvasTranslation.y + (maxHeight - displayHeight) / 2 + padding;

  canvas.width = workspaceWidth;
  canvas.height = workspaceHeight;

  ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, offset.x, offset.y, displayWidth, displayHeight);
}

function getPixelColorAtEvent(event) {
  if (!props.image) return null;
  const rect = canvasRef.value.getBoundingClientRect();
  const scaleX = canvasRef.value.width / rect.width;
  const scaleY = canvasRef.value.height / rect.height;
  const canvasX = (event.clientX - rect.left) * scaleX;
  const canvasY = (event.clientY - rect.top) * scaleY;
  const localX = canvasX - offset.x;
  const localY = canvasY - offset.y;
  const imageX = Math.floor(localX / props.scale);
  const imageY = Math.floor(localY / props.scale);
  if (
    imageX < 0 ||
    imageX >= props.image.width ||
    imageY < 0 ||
    imageY >= props.image.height
  )
    return null;
  const temp = document.createElement("canvas");
  temp.width = props.image.width;
  temp.height = props.image.height;
  const tempCtx = temp.getContext("2d");
  tempCtx.drawImage(props.image, 0, 0);
  const pixel = tempCtx.getImageData(imageX, imageY, 1, 1).data;
  return {
    x: imageX,
    y: imageY,
    rgba: [pixel[0], pixel[1], pixel[2], pixel[3]],
  };
}

function onCanvasClick(event) {
  if (!props.image) return;

  const data = getPixelColorAtEvent(event);
  if (data) {
    emit("color-pick", {
      ...data,
      modifier:
        event.altKey || event.ctrlKey || event.shiftKey
          ? "secondary"
          : "primary",
    });
  }
}

function handleResize() {
  renderImage();
}

watch(() => props.image, renderImage);
watch(() => props.scale, renderImage);

onMounted(() => {
  window.addEventListener("resize", handleResize);
  window.addEventListener("keydown", handleKeyDown);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<style scoped>
canvas {
  display: block;
}
</style>
