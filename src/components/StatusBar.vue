<template>
  <div class="status-bar">
    <span v-if="imageMeta">
      {{ imageMeta.width }} × {{ imageMeta.height }} px —
      {{ imageMeta.colorDepth }}-bit
    </span>
    <label v-if="imageMeta" class="zoom-label">
      Zoom:
      <input
        type="range"
        min="12"
        max="300"
        step="1"
        :value="Math.round(scale * 100)"
        @input="onZoomInput"
      />
      {{ Math.round(scale * 100) }}%
    </label>
  </div>
</template>

<script setup>
const props = defineProps({
  imageMeta: Object,
  scale: Number,
});
const emit = defineEmits(["update:scale"]);

function onZoomInput(e) {
  const percent = parseInt(e.target.value);
  emit("update:scale", percent / 100);
}
</script>

<style scoped>
.status-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem 1rem;
  background: #f8f8f8;
  border-top: 1px solid #ddd;
  font-size: 14px;
  font-family: monospace;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.zoom-label {
  font-size: 14px;
  font-family: sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
