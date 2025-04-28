<template>
  <div class="status-bar">
    <span v-if="imageMeta">
      {{ imageMeta.width }} × {{ imageMeta.height }} px —
      {{ imageMeta.colorDepth }}-bit
    </span>
  </div>
</template>

<script setup>
defineProps({
  imageMeta: Object,
});
</script>

<style scoped>
.status-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 0.5rem 1rem;
  background: #f8f8f8;
  border-top: 1px solid #ddd;
  font-size: 14px;
  font-family: monospace;
  z-index: 100;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);
}
</style>
