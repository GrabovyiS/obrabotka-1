export function generateLUT({ x1, y1, x2, y2 }) {
  const lut = new Uint8ClampedArray(256);

  for (let i = 0; i < 256; i++) {
    let result;

    if (i < x1) {
      result = y1;
    } else if (i > x2) {
      result = y2;
    } else {
      const t = (i - x1) / (x2 - x1);
      result = y1 + t * (y2 - y1);
    }

    lut[i] = Math.round(clamp(result, 0, 255));
  }

  return lut;
}

export function applyGradation(imageData, lut) {
  const src = imageData.data;
  const corrected = new Uint8ClampedArray(src.length);

  for (let i = 0; i < src.length; i += 4) {
    corrected[i + 0] = lut[src[i + 0]]; // R
    corrected[i + 1] = lut[src[i + 1]]; // G
    corrected[i + 2] = lut[src[i + 2]]; // B
    corrected[i + 3] = src[i + 3]; // A remains unchanged
  }

  return new ImageData(corrected, imageData.width, imageData.height);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
