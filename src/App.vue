<template>
  <div class="container">
    <FileUploader @file-selected="onFileSelected" />
    <CanvasDisplay :image="imageElement" />
    <StatusBar :imageMeta="imageMeta" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import FileUploader from "./components/FileUploader.vue";
import CanvasDisplay from "./components/CanvasDisplay.vue";
import StatusBar from "./components/StatusBar.vue";
import { parseCustomImage } from "./utils/imageParser";

const imageElement = ref(null);
const imageMeta = ref(null);

async function onFileSelected(file) {
  const isCustom = file.name.endsWith(".gb7");

  if (isCustom) {
    try {
      const { image, meta } = await parseCustomImage(file);
      imageElement.value = image;
      imageMeta.value = meta;
    } catch (err) {
      alert(`Failed to load .gb7 image: ${err.message}`);
    }
  } else {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const pixels = width * height;
        const fileBits = file.size * 8;
        const depth = Math.round(fileBits / pixels);

        imageElement.value = img;
        imageMeta.value = {
          width,
          height,
          colorDepth: depth || 24,
        };
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }
}
</script>

<style>
.container {
  max-width: 800px;
  margin: auto;
  padding: 1rem;
  padding-bottom: 3rem; /* space for fixed status bar */
}
</style>
