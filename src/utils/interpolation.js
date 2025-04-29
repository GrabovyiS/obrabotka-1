export function nearestNeighborInterpolation(
  srcImageData,
  targetWidth,
  targetHeight
) {
  const src = srcImageData.data;
  const srcWidth = srcImageData.width;
  const srcHeight = srcImageData.height;

  const dstImageData = new ImageData(targetWidth, targetHeight);
  const dst = dstImageData.data;

  const xRatio = srcWidth / targetWidth;
  const yRatio = srcHeight / targetHeight;

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const nearestX = Math.floor(x * xRatio);
      const nearestY = Math.floor(y * yRatio);

      const srcIndex = (nearestY * srcWidth + nearestX) * 4;
      const dstIndex = (y * targetWidth + x) * 4;

      dst[dstIndex] = src[srcIndex]; // R
      dst[dstIndex + 1] = src[srcIndex + 1]; // G
      dst[dstIndex + 2] = src[srcIndex + 2]; // B
      dst[dstIndex + 3] = src[srcIndex + 3]; // A
    }
  }

  return dstImageData;
}

export function bilinearInterpolation(srcImageData, targetWidth, targetHeight) {
  const src = srcImageData.data;
  const srcWidth = srcImageData.width;
  const srcHeight = srcImageData.height;

  const dstImageData = new ImageData(targetWidth, targetHeight);
  const dst = dstImageData.data;

  const xRatio = (srcWidth - 1) / targetWidth;
  const yRatio = (srcHeight - 1) / targetHeight;

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const xL = Math.floor(x * xRatio);
      const yT = Math.floor(y * yRatio);
      const xH = Math.min(xL + 1, srcWidth - 1);
      const yB = Math.min(yT + 1, srcHeight - 1);

      const xWeight = x * xRatio - xL;
      const yWeight = y * yRatio - yT;

      const srcTL = (yT * srcWidth + xL) * 4;
      const srcTR = (yT * srcWidth + xH) * 4;
      const srcBL = (yB * srcWidth + xL) * 4;
      const srcBR = (yB * srcWidth + xH) * 4;

      for (let c = 0; c < 4; c++) {
        // R, G, B, A
        const top = src[srcTL + c] * (1 - xWeight) + src[srcTR + c] * xWeight;
        const bottom =
          src[srcBL + c] * (1 - xWeight) + src[srcBR + c] * xWeight;
        dst[(y * targetWidth + x) * 4 + c] =
          top * (1 - yWeight) + bottom * yWeight;
      }
    }
  }

  return dstImageData;
}
