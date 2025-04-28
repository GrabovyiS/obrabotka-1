<template>
  <canvas ref="canvasRef"></canvas>
</template>

<script setup>
import { onMounted, ref, watch, onBeforeUnmount } from "vue";

const props = defineProps({
  image: Object,
});

const canvasRef = ref(null);
let ctx = null;

function renderImage(image) {
  if (!image || !canvasRef.value) return;

  const canvas = canvasRef.value;
  ctx = canvas.getContext("2d");

  canvas.width = image.width;
  canvas.height = image.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);
}

function handleResize() {
  if (props.image) {
    renderImage(props.image);
  }
}

watch(() => props.image, renderImage);
onMounted(() => window.addEventListener("resize", handleResize));
onBeforeUnmount(() => window.removeEventListener("resize", handleResize));
</script>

<style scoped>
canvas {
  border: 1px solid #ccc;
  max-width: 100%;
  height: auto;
  display: block;
  margin-bottom: 1rem;
}
</style>
