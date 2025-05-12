const D65 = { X: 95.047, Y: 100.0, Z: 108.883 };

function srgbToLinear(c) {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function rgbToXyz([r, g, b]) {
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);

  const X = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375;
  const Y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.072175;
  const Z = rl * 0.0193339 + gl * 0.119192 + bl * 0.9503041;

  return [X * 100, Y * 100, Z * 100];
}

function f(t) {
  const delta = 6 / 29;
  return t > Math.pow(delta, 3)
    ? Math.cbrt(t)
    : t / (3 * delta * delta) + 4 / 29;
}

export function xyzToLab([X, Y, Z]) {
  const x = f(X / D65.X);
  const y = f(Y / D65.Y);
  const z = f(Z / D65.Z);

  const L = 116 * y - 16;
  const a = 500 * (x - y);
  const b = 200 * (y - z);

  return [L, a, b];
}

export function labToLch([L, a, b]) {
  const C = Math.sqrt(a * a + b * b);
  let H = Math.atan2(b, a) * (180 / Math.PI);
  if (H < 0) H += 360;
  return [L, C, H];
}

export function rgbToOklch([r, g, b]) {
  // Convert sRGB to linear RGB
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);

  // Linear RGB to LMS
  const l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
  const m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
  const s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const C = Math.sqrt(a * a + b_ * b_);
  let H = Math.atan2(b_, a) * (180 / Math.PI);
  if (H < 0) H += 360;

  return [L * 100, C * 100, H];
}

export function calculateLuminance([r, g, b]) {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function calculateContrast(rgb1, rgb2) {
  const L1 = calculateLuminance(rgb1);
  const L2 = calculateLuminance(rgb2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}
