<template>
  <div class="color-inspector" v-if="hasAnyColor">
    <div v-for="(info, key) in filteredColors" :key="key" class="color-block">
      <h4>{{ capitalize(key) }} Color</h4>
      <div class="swatch" :style="{ backgroundColor: rgbaString(info.rgba) }" />
      <p>Coords: {{ info.x }}, {{ info.y }}</p>
      <p>RGBA: {{ info.rgba.join(", ") }}</p>

      <div class="space-block">
        <p title="CIE XYZ color space (X, Y, Z): tristimulus values">
          <strong>XYZ:</strong> {{ formatArr(colorSpaces[key].xyz) }}
        </p>
        <p title="CIE Lab color space (L*, a*, b*): perceptual uniform">
          <strong>Lab:</strong> {{ formatArr(colorSpaces[key].lab) }}
        </p>
        <p title="CIE LCH color space (L*, C*, H°): lightness, chroma, hue">
          <strong>LCH:</strong> {{ formatArr(colorSpaces[key].lch) }}
        </p>
        <p title="OKLCH color space: modern perceptual model">
          <strong>OKLCH:</strong> {{ formatArr(colorSpaces[key].oklch) }}
        </p>
      </div>
    </div>

    <div v-if="contrastRatio !== null" class="contrast-block">
      <p>
        <strong>Contrast:</strong> {{ contrastRatio.toFixed(2) }}
        <span :class="contrastRatio < 4.5 ? 'fail' : 'pass'">
          ({{ contrastRatio < 4.5 ? "Insufficient" : "Sufficient" }})
        </span>
      </p>
    </div>
  </div>

  <div class="color-inspector hint" v-else>
    <p>
      Select a color with the eyedropper tool.<br />
      Use Alt, Ctrl or Shift to select a secondary color.
    </p>
  </div>
</template>

<script setup>
import { computed } from "vue";

import {
  rgbToXyz,
  xyzToLab,
  labToLch,
  rgbToOklch,
  calculateContrast,
} from "../utils/colorConvert.js";

const props = defineProps({
  colors: {
    type: Object,
    default: () => ({}),
  },
});

const hasAnyColor = computed(
  () => props.colors.primary || props.colors.secondary
);

const filteredColors = computed(() => {
  const out = {};
  for (const key of ["primary", "secondary"]) {
    if (props.colors[key]) {
      out[key] = props.colors[key];
    }
  }
  return out;
});

const colorSpaces = computed(() => {
  const out = {};
  for (const key in filteredColors.value) {
    const rgba = filteredColors.value[key].rgba;
    const xyz = rgbToXyz(rgba);
    const lab = xyzToLab(xyz);
    const lch = labToLch(lab);
    const oklch = rgbToOklch(rgba);
    out[key] = { xyz, lab, lch, oklch };
  }
  return out;
});

const contrastRatio = computed(() => {
  const p = props.colors.primary;
  const s = props.colors.secondary;
  if (!p || !s) return null;

  return calculateContrast(p.rgba, s.rgba);
});

function rgbaString([r, g, b, a]) {
  return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
}

function formatArr(arr) {
  return arr.map((v) => Number(v.toFixed(2))).join(", ");
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
</script>

<style scoped>
.color-inspector {
  padding: 1rem;
  background: #f9f9f9;
  border-left: 1px solid #ddd;
  font-family: sans-serif;
  font-size: 14px;
  width: 250px;
  box-sizing: border-box;
}

.color-block {
  margin-bottom: 1.5rem;
}

.swatch {
  width: 100%;
  height: 30px;
  border: 1px solid #ccc;
  margin: 0.5rem 0;
}

.space-block {
  margin-top: 0.75rem;
}

.contrast-block {
  margin-top: 1rem;
  padding: 0.5rem;
  border-top: 1px solid #ccc;
}

.pass {
  color: green;
  font-weight: bold;
}

.fail {
  color: red;
  font-weight: bold;
}

.hint {
  font-style: italic;
  color: #666;
}
</style>
