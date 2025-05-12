<template>
  <div class="status-bar">
    <div class="info" v-if="hoverColor">
      Hover: ({{ hoverColor.x }}, {{ hoverColor.y }}) -
      <span
        class="color-swatch"
        :style="{ backgroundColor: toRGB(hoverColor.rgba) }"
      ></span>
      RGB({{ hoverColor.rgba.slice(0, 3).join(", ") }})
    </div>
    <div class="info" v-if="clickColor">
      Click: ({{ clickColor.x }}, {{ clickColor.y }}) -
      <span
        class="color-swatch"
        :style="{ backgroundColor: toRGB(clickColor.rgba) }"
      ></span>
      RGB({{ clickColor.rgba.slice(0, 3).join(", ") }})
    </div>

    <span v-if="imageMeta">
      {{ imageMeta.width }} × {{ imageMeta.height }} px
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
defineProps({
  imageMeta: Object,
  scale: Number,
  hoverColor: Object,
  clickColor: Object,
});

const emit = defineEmits(["update:scale"]);

function onZoomInput(e) {
  const val = parseInt(e.target.value, 10);
  emit("update:scale", val / 100);
}

function toRGB(rgba) {
  if (!rgba) return "transparent";
  return `rgb(${rgba[0]}, ${rgba[1]}, ${rgba[2]})`;
}
</script>

<style scoped>
.status-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #eee;
  border-top: 1px solid #ccc;
  font-family: monospace;
  font-size: 14px;
  padding: 0.5rem 1rem;
  display: flex;
  gap: 2rem;
  align-items: center;
  justify-content: space-between;
}

.info {
  min-width: 380px;
}

.zoom-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-swatch {
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 1px solid #999;
  margin: 0 0.5em;
  vertical-align: middle;
}
</style>
