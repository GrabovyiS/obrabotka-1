import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [imageSrc, setImageSrc] = useState("");
  const [imageSize, setImageSize] = useState({ height: 0, width: 0 });
  const [pixelInfo, setPixelInfo] = useState({
    x: 0,
    y: 0,
    color: "rgb(0,0,0)",
  });

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImageSrc(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e) => {
    setImageSrc(e.target.value);
  };

  const getColorAt = (event) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    const x = Math.floor(
      (event.clientX - rect.left) * (imageSize.width / canvas.width)
    );
    const y = Math.floor(
      (event.clientY - rect.top) * (imageSize.height / canvas.height)
    );

    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    const color = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;

    setPixelInfo({ x, y, color });
  };

  useEffect(() => {
    if (!imageSrc) return;

    const img = imgRef.current;
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
  }, [imageSrc]);

  const handleImageLoad = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
      alert("Failed to load image. CORS restrictions may apply.");
      return;
    }

    setImageSize({ width: img.naturalWidth, height: img.naturalHeight });

    // Scale while keeping aspect ratio
    const maxWidth = window.innerWidth * 0.8;
    const maxHeight = window.innerHeight * 0.8;

    let scale = Math.min(
      maxWidth / img.naturalWidth,
      maxHeight / img.naturalHeight
    );
    let newWidth = img.naturalWidth * scale;
    let newHeight = img.naturalHeight * scale;

    canvas.width = newWidth;
    canvas.height = newHeight;

    ctx.drawImage(img, 0, 0, newWidth, newHeight);
  };

  return (
    <>
      <h1>
        The app only accepts URLs from resources that allow cross-origin
        requests for images, like <strong>Unsplash</strong> or{" "}
        <strong>Pixabay</strong>.
      </h1>
      <div className="inputs">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          ref={fileInputRef}
        />
        <input
          type="text"
          className="url"
          placeholder="Enter image URL"
          onBlur={handleImageUrlChange}
        />
      </div>

      <img
        ref={imgRef}
        src=""
        alt=""
        style={{ display: "none" }}
        onLoad={handleImageLoad}
      />

      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          onClick={getColorAt}
          onMouseMove={getColorAt}
          style={{
            border: "1px solid black",
            cursor: "crosshair",
            maxWidth: "100%",
          }}
        ></canvas>
      </div>

      <div className="info">
        <p>
          Selected Pixel info. (x: {pixelInfo.x}, y: {pixelInfo.y}), Color:{" "}
          <span style={{ background: pixelInfo.color, padding: "2px 10px" }}>
            {pixelInfo.color}
          </span>{" "}
        </p>
        <p>
          Original Image size: Height: {imageSize.height}px, Width:{" "}
          {imageSize.width}px
        </p>
      </div>
    </>
  );
}

export default App;
