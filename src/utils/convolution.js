export function applyConvolution(imageData, kernel) {
  const { width, height, data } = imageData;
  const result = new Uint8ClampedArray(data.length);
  const getIndex = (x, y) => (y * width + x) * 4;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx));
          const py = Math.min(height - 1, Math.max(0, y + ky));
          const i = getIndex(px, py);
          const weight = kernel[(ky + 1) * 3 + (kx + 1)];

          r += data[i] * weight;
          g += data[i + 1] * weight;
          b += data[i + 2] * weight;
        }
      }

      const idx = getIndex(x, y);
      result[idx] = clamp(r);
      result[idx + 1] = clamp(g);
      result[idx + 2] = clamp(b);
      result[idx + 3] = data[idx + 3];
    }
  }

  return new ImageData(result, width, height);
}

function clamp(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}
