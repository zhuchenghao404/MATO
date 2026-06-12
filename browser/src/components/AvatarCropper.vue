<template>
  <div class="cropper-overlay" @click.self="$emit('cancel')">
    <div class="cropper-modal">
      <div class="cropper-header">
        <span class="cropper-title">✂ 裁剪头像</span>
        <button class="cropper-close" @click="$emit('cancel')">✕</button>
      </div>

      <div class="cropper-body">
        <div class="cropper-container">
          <img ref="imgRef" :src="imageUrl" alt="待裁剪图片" />
        </div>
      </div>

      <div class="cropper-footer">
        <div class="cropper-hint">拖动边框自由裁剪，可缩放</div>
        <div class="cropper-actions">
          <button class="comic-btn white small" @click="$emit('cancel')">取消</button>
          <button class="comic-btn small" @click="handleConfirm" :disabled="processing">
            {{ processing ? '处理中...' : '确认上传' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

const props = defineProps({
  file: { type: File, required: true },
})

const emit = defineEmits(['confirm', 'cancel'])

const imgRef = ref(null)
const imageUrl = ref('')
let cropper = null
const processing = ref(false)

onMounted(async () => {
  // 创建 object URL
  imageUrl.value = URL.createObjectURL(props.file)

  await nextTick()
  initCropper()
})

function initCropper() {
  if (!imgRef.value) return
  cropper = new Cropper(imgRef.value, {
    viewMode: 1,
    dragMode: 'move',
    aspectRatio: NaN,       // 自由裁剪
    autoCropArea: 1,
    cropBoxResizable: true,
    cropBoxMovable: true,
    guides: true,
    center: true,
    highlight: false,
    modal: false,
    background: false,
    responsive: true,
    checkCrossOrigin: false,
  })
}

async function handleConfirm() {
  if (!cropper) return
  processing.value = true
  try {
    const canvas = cropper.getCroppedCanvas({
      maxWidth: 1024,
      maxHeight: 1024,
      imageSmoothingQuality: 'high',
    })
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
    if (!blob) {
      alert('裁剪失败，请重试')
      return
    }
    const croppedFile = new File([blob], props.file.name.replace(/\.[^.]+$/, '.png'), {
      type: 'image/png',
    })
    emit('confirm', croppedFile)
  } catch (e) {
    console.error('[AvatarCropper]', e)
    alert('裁剪处理失败')
  } finally {
    processing.value = false
  }
}

onUnmounted(() => {
  if (cropper) {
    cropper.destroy()
    cropper = null
  }
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value)
  }
})
</script>

<style scoped>
.cropper-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10000;
  background: #fff;
}

.cropper-modal {
  width: 100vw;
  height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Comic Neue', 'Segoe UI', cursive, sans-serif;
}

.cropper-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.2rem;
  border-bottom: 3px solid #000;
  background: #f9f9f9;
}

.cropper-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #000;
}

.cropper-close {
  width: 32px;
  height: 32px;
  border: 2px solid #000;
  background: #fff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cropper-close:hover {
  background: #ff4444;
  color: #fff;
}

.cropper-body {
  flex: 1;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: #f0f0f0;
}

.cropper-container {
  width: 100%;
  max-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cropper-container img {
  max-width: 100%;
  display: block;
  margin: 0 auto;
}

.cropper-footer {
  padding: 0.8rem 1.2rem;
  border-top: 3px solid #000;
  background: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.cropper-hint {
  font-size: 0.8rem;
  color: #666;
  font-weight: 600;
}

.cropper-actions {
  display: flex;
  gap: 0.6rem;
  flex-shrink: 0;
}

/* 复用 Profile.vue 已有的 comic-btn 风格 — 这里只确保基础按钮 */
.comic-btn {
  padding: 0.5rem 1.2rem;
  border: 3px solid #000;
  background: #ffd700;
  font-family: 'Comic Neue', cursive, sans-serif;
  font-weight: 800;
  font-size: 0.9rem;
  cursor: pointer;
  box-shadow: 4px 4px 0 #000;
  transition: all 0.08s linear;
  text-transform: uppercase;
}

.comic-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 #000;
}

.comic-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: 4px 4px 0 #000;
}

.comic-btn.white {
  background: #fff;
}
</style>

<!-- cropperjs 生成的容器需要非 scoped 样式才能作用 -->
<style>
.cropper-overlay .cropper-container {
  margin: 0 auto;
}

.cropper-overlay .cropper-crop-box,
.cropper-overlay .cropper-face {
  border-radius: 0;
}
</style>