export function nearestNeighborInterpolation(
  sourceImageData,
  targetWidth,
  targetHeight
) {
  const sourcePixels = sourceImageData.data;
  const sourceWidth = sourceImageData.width;
  const sourceHeight = sourceImageData.height;

  const resizedImageData = new ImageData(targetWidth, targetHeight);
  const resizedPixels = resizedImageData.data;

  const widthScaleFactor = sourceWidth / targetWidth;
  const heightScaleFactor = sourceHeight / targetHeight;

  for (let targetY = 0; targetY < targetHeight; targetY++) {
    for (let targetX = 0; targetX < targetWidth; targetX++) {
      const nearestSourceX = Math.floor(targetX * widthScaleFactor);
      const nearestSourceY = Math.floor(targetY * heightScaleFactor);

      // * 4 because of ImageData structure
      const sourceIndex = (nearestSourceY * sourceWidth + nearestSourceX) * 4;
      const targetIndex = (targetY * targetWidth + targetX) * 4;

      resizedPixels[targetIndex] = sourcePixels[sourceIndex]; // R
      resizedPixels[targetIndex + 1] = sourcePixels[sourceIndex + 1]; // G
      resizedPixels[targetIndex + 2] = sourcePixels[sourceIndex + 2]; // B
      resizedPixels[targetIndex + 3] = sourcePixels[sourceIndex + 3]; // A
    }
  }

  return resizedImageData;
}

export function bilinearInterpolation(
  sourceImageData,
  targetWidth,
  targetHeight
) {
  const sourcePixels = sourceImageData.data;
  const sourceWidth = sourceImageData.width;
  const sourceHeight = sourceImageData.height;

  const resizedImageData = new ImageData(targetWidth, targetHeight);
  const resizedPixels = resizedImageData.data;

  const scaleX = (sourceWidth - 1) / targetWidth;
  const scaleY = (sourceHeight - 1) / targetHeight;

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const sourceX = x * scaleX;
      const sourceY = y * scaleY;

      const xFloor = Math.floor(sourceX);
      const yFloor = Math.floor(sourceY);
      const xCeil = Math.min(xFloor + 1, sourceWidth - 1);
      const yCeil = Math.min(yFloor + 1, sourceHeight - 1);

      const xWeight = sourceX - xFloor;
      const yWeight = sourceY - yFloor;

      const topLeftIndex = (yFloor * sourceWidth + xFloor) * 4;
      const topRightIndex = (yFloor * sourceWidth + xCeil) * 4;
      const bottomLeftIndex = (yCeil * sourceWidth + xFloor) * 4;
      const bottomRightIndex = (yCeil * sourceWidth + xCeil) * 4;

      for (let channel = 0; channel < 4; channel++) {
        const top =
          sourcePixels[topLeftIndex + channel] * (1 - xWeight) +
          sourcePixels[topRightIndex + channel] * xWeight;

        const bottom =
          sourcePixels[bottomLeftIndex + channel] * (1 - xWeight) +
          sourcePixels[bottomRightIndex + channel] * xWeight;

        const interpolated = top * (1 - yWeight) + bottom * yWeight;

        resizedPixels[(y * targetWidth + x) * 4 + channel] = interpolated;
      }
    }
  }

  return resizedImageData;
}
