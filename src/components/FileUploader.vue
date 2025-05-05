<template>
  <div class="file-uploader">
    <input
      type="file"
      accept=".png,.jpg,.jpeg,.gb7"
      @change="handleFileChange"
    />
    <input type="url" v-model="url" placeholder="Image URL" />
    <button @click="handleUrlLoad">Load from URL</button>
  </div>
</template>

<script setup>
import { ref } from "vue";

const url = ref("");
const emit = defineEmits(["file-selected", "url-selected"]);

function handleUrlLoad() {
  if (url.value) emit("url-selected", url.value);
}

function handleFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  const extension = file.name.split(".").pop()?.toLowerCase();
  const validExtensions = ["png", "jpg", "jpeg", "gb7"];
  if (!validExtensions.includes(extension)) {
    alert("Unsupported file format.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => emit("file-selected", { file, buffer: reader.result });
  reader.readAsArrayBuffer(file);
}
</script>

<style scoped>
.file-uploader {
  display: flex;
  gap: 1rem;
  margin-right: 2rem;
}

input[type="file"] {
  width: 180px;
}
</style>
