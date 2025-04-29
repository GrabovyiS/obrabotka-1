<template>
  <dialog ref="dialogRef" class="resize-modal">
    <form @submit.prevent="applyResize">
      <h2>Resize Image</h2>

      <div class="info">
        <p>Original: {{ originalMP }} MP</p>
        <p>New: {{ newMP }} MP</p>
      </div>

      <label>
        Scale Mode:
        <select v-model="mode">
          <option value="percent">Percent</option>
          <option value="pixels">Pixels</option>
        </select>
      </label>

      <label>
        Width:
        <input v-model.number="width" type="number" min="1" />
      </label>
      <label>
        Height:
        <input
          v-model.number="height"
          type="number"
          min="1"
          :disabled="lockAspect"
        />
      </label>

      <label>
        <input type="checkbox" v-model="lockAspect" />
        Maintain Aspect Ratio
      </label>

      <label>
        Interpolation:
        <select
          v-model="method"
          title="Nearest: faster, blocky. Bilinear: smoother, slower."
        >
          <option value="bilinear">Bilinear</option>
          <option value="nearest">Nearest Neighbor</option>
        </select>
      </label>

      <div class="buttons">
        <button type="submit">Apply</button>
        <button type="button" @click="close">Cancel</button>
      </div>
    </form>
  </dialog>
</template>

<script setup>
import { ref, watch, computed } from "vue";

const props = defineProps({
  imageMeta: Object,
  open: Boolean,
});
const emit = defineEmits(["close", "confirm"]);

const dialogRef = ref(null);

watch(
  () => props.open,
  (val) => {
    if (val) dialogRef.value?.showModal();
    else dialogRef.value?.close();
  }
);

const mode = ref("percent");
const lockAspect = ref(true);
const method = ref("bilinear");

const width = ref(100);
const height = ref(100);

const originalMP = computed(() => {
  if (!props.imageMeta) return "0.00";
  const px = props.imageMeta.width * props.imageMeta.height;
  return (px / 1_000_000).toFixed(2);
});

const newMP = computed(() => {
  if (!props.imageMeta) return "0.00";

  const w =
    mode.value === "percent"
      ? props.imageMeta.width * (width.value / 100)
      : width.value;
  const h =
    mode.value === "percent"
      ? props.imageMeta.height * (height.value / 100)
      : height.value;

  return ((w * h) / 1_000_000).toFixed(2);
});

watch(width, (val) => {
  if (lockAspect.value && mode.value === "pixels") {
    const ratio = props.imageMeta.height / props.imageMeta.width;
    height.value = Math.round(val * ratio);
  }
});

function applyResize() {
  const w =
    mode.value === "percent"
      ? Math.round(props.imageMeta.width * (width.value / 100))
      : width.value;
  const h =
    mode.value === "percent"
      ? Math.round(props.imageMeta.height * (height.value / 100))
      : height.value;

  if (w <= 0 || h <= 0) {
    alert("Width and height must be positive.");
    return;
  }

  emit("confirm", { width: w, height: h, method: method.value });
  close();
}

function close() {
  emit("close");
  dialogRef.value?.close();
}

watch(mode, (newMode, oldMode) => {
  if (!props.imageMeta) return;

  let realWidth, realHeight;

  if (oldMode === "percent") {
    realWidth = props.imageMeta.width * (width.value / 100);
    realHeight = props.imageMeta.height * (height.value / 100);
  } else {
    realWidth = width.value;
    realHeight = height.value;
  }

  if (newMode === "percent") {
    width.value = Math.round((realWidth / props.imageMeta.width) * 100);
    height.value = Math.round((realHeight / props.imageMeta.height) * 100);
  } else {
    width.value = Math.round(realWidth);
    height.value = Math.round(realHeight);
  }

  if (lockAspect.value) {
    updateHeightFromWidth();
  }
});

function updateHeightFromWidth() {
  if (!props.imageMeta) return;

  const aspectRatio = props.imageMeta.height / props.imageMeta.width;

  if (mode.value === "percent") {
    height.value = width.value; // percent = same for both
  } else {
    height.value = Math.round(width.value * aspectRatio);
  }
}

watch(width, () => {
  if (lockAspect.value) {
    updateHeightFromWidth();
  }
});

watch(lockAspect, (locked) => {
  if (locked) {
    updateHeightFromWidth();
  }
});
</script>

<style scoped>
.resize-modal {
  padding: 1.5rem;
  width: 300px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-family: sans-serif;
}

form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}
</style>
