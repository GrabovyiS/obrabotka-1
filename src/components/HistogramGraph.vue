<template>
  <svg
    class="histogram"
    viewBox="0 0 256 100"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polyline
      v-if="histogram.r.length"
      :points="points(histogram.r)"
      fill="none"
      stroke="red"
      stroke-width="1"
    />
    <polyline
      v-if="histogram.g.length"
      :points="points(histogram.g)"
      fill="none"
      stroke="green"
      stroke-width="1"
    />
    <polyline
      v-if="histogram.b.length"
      :points="points(histogram.b)"
      fill="none"
      stroke="blue"
      stroke-width="1"
    />

    <!-- Correction Curve: horizontal left line -->
    <line
      v-if="hasCurve"
      :x1="0"
      :y1="100 - (y1 / 255) * 100"
      :x2="x1"
      :y2="100 - (y1 / 255) * 100"
      stroke="black"
      stroke-width="1"
    />
    <!-- Correction Curve: main diagonal segment -->
    <line
      v-if="hasCurve"
      :x1="x1"
      :y1="100 - (y1 / 255) * 100"
      :x2="x2"
      :y2="100 - (y2 / 255) * 100"
      stroke="black"
      stroke-width="2"
    />
    <!-- Correction Curve: horizontal right line -->
    <line
      v-if="hasCurve"
      :x1="x2"
      :y1="100 - (y2 / 255) * 100"
      :x2="255"
      :y2="100 - (y2 / 255) * 100"
      stroke="black"
      stroke-width="1"
    />
  </svg>
</template>

<script setup>
import { ref, watch, computed } from "vue";

const props = defineProps({
  image: Object,
  x1: Number,
  y1: Number,
  x2: Number,
  y2: Number,
});

const histogram = ref({ r: [], g: [], b: [] });

const hasCurve = computed(() => {
  return (
    typeof props.x1 === "number" &&
    typeof props.y1 === "number" &&
    typeof props.x2 === "number" &&
    typeof props.y2 === "number" &&
    props.x1 < props.x2
  );
});

watch(
  () => props.image,
  (img) => {
    if (!img) return;

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const data = ctx.getImageData(0, 0, img.width, img.height).data;
    const r = new Array(256).fill(0);
    const g = new Array(256).fill(0);
    const b = new Array(256).fill(0);

    for (let i = 0; i < data.length; i += 4) {
      r[data[i]]++;
      g[data[i + 1]]++;
      b[data[i + 2]]++;
    }

    histogram.value = { r, g, b };
  },
  { immediate: true }
);

function points(data) {
  const max = Math.max(...data);
  return data
    .map((val, i) => {
      const x = i;
      const y = 100 - (val / max) * 100;
      return `${x},${y.toFixed(1)}`;
    })
    .join(" ");
}
</script>

<style scoped>
.histogram {
  width: 100%;
  height: 100px;
  background: #f0f0f0;
  border: 1px solid #ccc;
}
</style>
