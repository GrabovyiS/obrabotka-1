export async function parseCustomImage(buffer) {
  const data = new DataView(buffer);

  // Validate file signature
  if (
    data.getUint8(0) !== 0x47 || // 'G'
    data.getUint8(1) !== 0x42 || // 'B'
    data.getUint8(2) !== 0x37 || // '7'
    data.getUint8(3) !== 0x1d
  ) {
    throw new Error("Invalid GrayBit-7 file signature");
  }

  const version = data.getUint8(4);
  if (version !== 0x01) throw new Error("Unsupported GrayBit-7 version");

  const flag = data.getUint8(5);
  const hasMask = (flag & 0b00000001) === 1;

  const width = data.getUint16(6, false); // big-endian
  const height = data.getUint16(8, false); // big-endian
  const pixels = width * height;
  const pixelStart = 12;

  const rgba = new Uint8ClampedArray(pixels * 4);
  for (let i = 0; i < pixels; i++) {
    const byte = data.getUint8(pixelStart + i);
    const gray = byte & 0b01111111;
    const mask = hasMask ? (byte & 0b10000000 ? 255 : 0) : 255;

    const idx = i * 4;
    rgba[idx + 0] = gray;
    rgba[idx + 1] = gray;
    rgba[idx + 2] = gray;
    rgba[idx + 3] = mask;
  }

  const imageData = new ImageData(rgba, width, height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").putImageData(imageData, 0, 0);

  const image = new Image();
  image.src = canvas.toDataURL();
  await new Promise((resolve) => (image.onload = resolve));

  const fileBits = buffer.byteLength * 8;
  const colorDepth = Math.round(fileBits / pixels);

  return {
    image,
    meta: {
      width,
      height,
      colorDepth,
      hasMask,
    },
  };
}
