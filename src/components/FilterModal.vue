<template>
  <div class="filter-modal" v-if="open">
    <h2>Kernel Filter</h2>

    <label>
      Preset:
      <select v-model="selectedPreset" @change="applyPreset">
        <option value="identity">Identity</option>
        <option value="sharpen">Sharpen</option>
        <option value="gaussian">Gaussian Blur</option>
        <option value="box">Box Blur</option>
      </select>
    </label>

    <div class="kernel-grid">
      <input
        v-for="(value, index) in kernelValues"
        :key="index"
        type="number"
        step="0.1"
        v-model.number="kernelValues[index]"
      />
    </div>

    <label class="preview-checkbox">
      <input type="checkbox" v-model="preview" @change="emitPreview" />
      Preview Filter
    </label>

    <div class="actions">
      <button @click="apply">Apply</button>
      <button @click="reset">Reset</button>
      <button @click="close">Close</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  open: Boolean,
});
const emit = defineEmits(["close", "apply", "preview"]);

const selectedPreset = ref("identity");
const preview = ref(false);
const kernelValues = ref(Array(9).fill(0));
applyPreset(); // set initial values

watch(
  () => props.open,
  (val) => {
    if (val) applyPreset();
  }
);

function applyPreset() {
  const presets = {
    identity: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    sharpen: [0, -1, 0, -1, 5, -1, 0, -1, 0],
    gaussian: [1, 2, 1, 2, 4, 2, 1, 2, 1].map((v) => v / 16),
    box: Array(9).fill(1 / 9),
  };
  kernelValues.value = [...presets[selectedPreset.value]];
  emitPreview();
}

function apply() {
  emit("apply", {
    kernel: [...kernelValues.value],
  });
}

function emitPreview() {
  emit("preview", {
    kernel: [...kernelValues.value],
    preview: preview.value,
  });
}

function reset() {
  applyPreset();
  preview.value = false;
}

function close() {
  emit("close");
}
</script>

<style scoped>
.filter-modal {
  position: fixed;
  top: 60px;
  right: 0;
  width: 320px;
  background: white;
  padding: 1rem;
  border-left: 1px solid #ccc;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 500;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.kernel-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  margin: 1rem 0;
}

.kernel-grid input {
  width: 100%;
  text-align: center;
}

.preview-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.actions {
  display: flex;
  justify-content: space-between;
}
</style>
