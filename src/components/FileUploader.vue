<template>
  <div class="file-uploader">
    <input
      type="file"
      accept=".png,.jpg,.jpeg,.gb7"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup>
const emit = defineEmits(["file-selected"]);

function handleFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  const extension = file.name.split(".").pop()?.toLowerCase();
  const validExtensions = ["png", "jpg", "jpeg", "gb7"];

  if (!validExtensions.includes(extension)) {
    alert("Unsupported file format. Please upload PNG, JPG, or .gb7 files.");
    return;
  }

  emit("file-selected", file);
}
</script>

<style scoped>
.file-uploader {
  margin-bottom: 1rem;
}
</style>
