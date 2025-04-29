<template>
  <canvas ref="canvasRef" @click="onCanvasClick"></canvas>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  image: Object,
  scale: { type: Number, default: 1.0 },
  activeTool: { type: String, default: null },
});

const emit = defineEmits(["color-pick"]);

const canvasRef = ref(null);
const offset = reactive({ x: 0, y: 0 });
const canvasTranslation = reactive({ x: 0, y: 0 });
const layoutPadding = 50;

function renderImage() {
  if (!props.image || !canvasRef.value) return;

  const canvas = canvasRef.value;
  const ctx = canvas.getContext("2d");
  const image = props.image;

  const workspaceWidth = window.innerWidth;
  const workspaceHeight = window.innerHeight;

  const maxWidth = workspaceWidth - 2 * layoutPadding;
  const maxHeight = workspaceHeight - 2 * layoutPadding;

  const scaleFactor = props.scale;
  const displayWidth = image.width * scaleFactor;
  const displayHeight = image.height * scaleFactor;

  const dx =
    canvasTranslation.x + (maxWidth - displayWidth) / 2 + layoutPadding;
  const dy =
    canvasTranslation.y + (maxHeight - displayHeight) / 2 + layoutPadding;

  offset.x = dx;
  offset.y = dy;

  canvas.width = workspaceWidth;
  canvas.height = workspaceHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, dx, dy, displayWidth, displayHeight);
}

function onCanvasClick(event) {
  if (props.activeTool !== "eyedropper" || !props.image) return;

  const canvas = canvasRef.value;
  const rect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

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
  ) {
    console.warn("Click outside image bounds:", imageX, imageY);
    return;
  }

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = props.image.width;
  tempCanvas.height = props.image.height;
  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.drawImage(props.image, 0, 0);

  const pixel = tempCtx.getImageData(imageX, imageY, 1, 1).data;

  emit("color-pick", {
    x: imageX,
    y: imageY,
    rgba: [pixel[0], pixel[1], pixel[2], pixel[3]],
    modifier:
      event.altKey || event.ctrlKey || event.shiftKey ? "secondary" : "primary",
  });
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
}
</style>
