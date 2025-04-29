<template>
  <canvas ref="canvasRef"></canvas>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  image: Object, // full image element
  scale: {
    // current zoom (e.g. 1.0 = 100%)
    type: Number,
    default: 1.0,
  },
});

const canvasRef = ref(null);
let ctx = null;

function renderImage() {
  const canvas = canvasRef.value;
  if (!canvas || !props.image) return;

  const image = props.image;
  const padding = 50;
  const scale = props.scale;

  const displayWidth = Math.floor(image.width * scale);
  const displayHeight = Math.floor(image.height * scale);

  // Set canvas size to fill screen with padding
  const availableWidth = window.innerWidth - 2 * padding;
  const availableHeight = window.innerHeight - 2 * padding;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Center scaled image
  const offsetX = Math.floor((canvas.width - displayWidth) / 2);
  const offsetY = Math.floor((canvas.height - displayHeight) / 2);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, offsetX, offsetY, displayWidth, displayHeight);
}

function handleResize() {
  renderImage();
}

watch(() => props.image, renderImage);
watch(() => props.scale, renderImage);
onMounted(() => window.addEventListener("resize", handleResize));
onBeforeUnmount(() => window.removeEventListener("resize", handleResize));
</script>

<style scoped>
canvas {
  display: block;
  width: 100vw;
  height: calc(100vh - 80px);
}
</style>
