<script setup>
import { ref, watch, onMounted } from 'vue'
import productService from '../services/productService'
import { getImageUrl } from '../services/api'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  maxFiles: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['update:modelValue', 'upload-success', 'upload-error'])

const fileInput = ref(null)
const previews = ref([])
const isUploading = ref(false)

const initPreviews = () => {
  if (props.modelValue && props.modelValue.length > 0 && previews.value.length === 0) {
    previews.value = props.modelValue.map(url => ({
      file: null,
      url: getImageUrl(url),
      isUploaded: true,
      serverUrl: url
    }))
  }
}

onMounted(initPreviews)
watch(() => props.modelValue, initPreviews)

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileChange = (event) => {
  const files = Array.from(event.target.result || event.target.files)
  addFiles(files)
}

const addFiles = (files) => {
  if (previews.value.length + files.length > props.maxFiles) {
    alert(`최대 ${props.maxFiles}장까지 업로드 가능합니다.`)
    files = files.slice(0, props.maxFiles - previews.value.length)
  }

  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      previews.value.push({
        file,
        url: e.target.result,
        isUploaded: false,
        serverUrl: null
      })
    }
    reader.readAsDataURL(file)
  })
  
  // Reset input
  if (fileInput.value) fileInput.value.value = ''
}

const removeImage = (index) => {
  previews.value.splice(index, 1)
  updateModelValue()
}

const uploadAll = async () => {
  const pendingFiles = previews.value.filter(p => !p.isUploaded).map(p => p.file)
  if (pendingFiles.length === 0) return

  isUploading.value = true
  try {
    const response = await productService.uploadImages(pendingFiles)
    const uploadedUrls = response.data // List<String>
    
    let urlIndex = 0
    previews.value.forEach(p => {
      if (!p.isUploaded) {
        p.isUploaded = true
        p.serverUrl = uploadedUrls[urlIndex++]
      }
    })
    
    updateModelValue()
    emit('upload-success', uploadedUrls)
  } catch (error) {
    console.error('Image upload failed:', error)
    emit('upload-error', error)
    alert('이미지 업로드에 실패했습니다.')
  } finally {
    isUploading.value = false
  }
}

const updateModelValue = () => {
  const currentUrls = previews.value
    .filter(p => p.isUploaded)
    .map(p => p.serverUrl)
  emit('update:modelValue', currentUrls)
}

// Expose internal methods to parent
defineExpose({
  uploadAll,
  previews
})

const onDrop = (e) => {
  const files = Array.from(e.dataTransfer.files)
  addFiles(files)
}
</script>

<template>
  <div class="image-upload-container" @dragover.prevent @drop.prevent="onDrop">
    <div class="preview-grid">
      <!-- 업로드된/선택된 이미지 미리보기 -->
      <div v-for="(item, index) in previews" :key="index" class="preview-item">
        <img :src="item.url" alt="Preview" />
        <button type="button" class="remove-btn" @click="removeImage(index)">×</button>
        <div v-if="!item.isUploaded && isUploading" class="upload-overlay">
          <span class="spinner"></span>
        </div>
      </div>

      <!-- 추가 버튼 -->
      <button 
        v-if="previews.length < maxFiles"
        type="button" 
        class="add-box" 
        @click="triggerFileInput"
        :disabled="isUploading"
      >
        <span class="plus-icon">+</span>
        <span class="count">{{ previews.length }} / {{ maxFiles }}</span>
      </button>
    </div>

    <input
      ref="fileInput"
      type="file"
      multiple
      accept="image/*"
      class="hidden-input"
      @change="handleFileChange"
    />
    
    <p class="upload-hint">이미지를 드래그하거나 클릭하여 추가하세요. (최대 {{ maxFiles }}장)</p>
  </div>
</template>

<style scoped>
.image-upload-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.preview-item, .add-box {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  position: relative;
  overflow: hidden;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
}

.add-box {
  background: var(--color-background-elevated);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.add-box:hover {
  border-color: var(--color-primary);
}

.plus-icon {
  font-size: 24px;
  color: var(--color-text-muted);
}

.count {
  font-size: 12px;
  color: var(--color-text-muted);
}

.hidden-input {
  display: none;
}

.upload-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.upload-hint {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
}
</style>
