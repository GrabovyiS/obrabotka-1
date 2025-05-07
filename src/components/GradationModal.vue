<template>
  <div class="gradation-modal" v-if="open">
    <h2>Gradation Correction</h2>

    <HistogramGraph
      v-if="image"
      :image="image"
      :x1="x1"
      :y1="y1"
      :x2="x2"
      :y2="y2"
      class="histogram"
    />

    <form @submit.prevent="applyCorrection" class="form">
      <div class="points">
        <div>
          <label>x1:</label>
          <input type="number" v-model.number="x1" min="0" max="255" />
        </div>
        <div>
          <label>y1:</label>
          <input type="number" v-model.number="y1" min="0" max="255" />
        </div>
        <div>
          <label>x2:</label>
          <input type="number" v-model.number="x2" min="0" max="255" />
        </div>
        <div>
          <label>y2:</label>
          <input type="number" v-model.number="y2" min="0" max="255" />
        </div>
      </div>

      <label class="preview-checkbox">
        <input type="checkbox" v-model="preview" />
        Preview Correction
      </label>

      <div class="actions">
        <button type="submit">Apply</button>
        <button type="button" @click="reset">Reset</button>
        <button type="button" @click="close">Close</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import HistogramGraph from "./HistogramGraph.vue";

const props = defineProps({
  open: Boolean,
  image: Object,
});
const emit = defineEmits(["close", "apply"]);

const x1 = ref(0);
const y1 = ref(0);
const x2 = ref(255);
const y2 = ref(255);
const preview = ref(false);

function applyCorrection() {
  if (x1.value >= x2.value) {
    alert("x1 must be less than x2.");
    return;
  }
  emit("apply", {
    points: [
      { x: x1.value, y: y1.value },
      { x: x2.value, y: y2.value },
    ],
    preview: preview.value,
  });
}

function reset() {
  x1.value = 0;
  y1.value = 0;
  x2.value = 255;
  y2.value = 255;
}

function close() {
  emit("close");
}

watch([x1, y1, x2, y2, preview], () => {
  emit("preview", {
    points: [
      { x: x1.value, y: y1.value },
      { x: x2.value, y: y2.value },
    ],
    preview: preview.value,
  });
});
</script>

<style scoped>
.gradation-modal {
  position: fixed;
  top: 60px;
  right: 30px;
  width: 350px;
  height: calc(100vh - 60px);
  background: #fff;
  border-left: 1px solid #ccc;
  padding: 1rem;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  z-index: 500;
}

.histogram {
  width: 100%;
  height: 200px;
  margin-bottom: 1rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.points {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.preview-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}
</style>
