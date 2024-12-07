<template>
  <div class="create-rating-container">
    <div class="create-rating-box">
      <h1 class="title">创建评分</h1>
      
      <el-form 
        ref="formRef"
        :model="ratingForm"
        :rules="rules"
        label-position="top"
        class="rating-form"
      >
        <el-form-item label="标题" prop="title">
          <el-input 
            v-model="ratingForm.title"
            placeholder="请输入评分标题"
          />
        </el-form-item>

        <el-form-item label="描述" prop="text">
          <el-input 
            v-model="ratingForm.text"
            type="textarea"
            :rows="4"
            placeholder="请输入评分描述"
          />
        </el-form-item>

        <el-form-item label="图片" prop="image">
          <el-upload
            class="image-upload"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :auto-upload="false"
            :on-change="handleImageChange"
            accept="image/*"
          >
            <div class="upload-content">
              <template v-if="imageUrl">
                <div class="image-preview-container">
                  <img :src="imageUrl" class="preview-image" />
                  <div class="image-info">
                    <el-tooltip
                      :content="imageFile?.name || ''"
                      placement="top"
                      :show-after="500"
                    >
                      <div class="image-name">{{ imageFile?.name || '' }}</div>
                    </el-tooltip>
                    <el-button
                      type="danger"
                      :icon="Delete"
                      circle
                      size="small"
                      @click.stop="handleDeleteImage"
                    />
                  </div>
                </div>
              </template>
              <div v-else class="upload-placeholder">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <div class="upload-text">点击上传图片</div>
              </div>
            </div>
          </el-upload>
        </el-form-item>

        <el-button 
          type="primary" 
          class="submit-btn"
          :loading="loading"
          @click="handleSubmit"
        >
          提交评分
        </el-button>
      </el-form>
    </div>
    
    <el-dialog
      v-model="showCropper"
      title="裁剪图片"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="cropper-container">
        <VueCropper
          ref="cropperRef"
          :img="cropperImage"
          :autoCrop="true"
          :fixedBox="true"
          :fixed="true"
          :fixedNumber="[1, 1]"
          :centerBox="true"
          :info="true"
          :full="true"
          :high="true"
          outputType="jpeg"
          :outputSize="1"
        />
      </div>
      <template #footer>
        <el-button @click="showCropper = false">取消</el-button>
        <el-button type="primary" @click="handleCropImage">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { FormInstance, UploadProps, UploadUserFile } from 'element-plus'
import { ElMessage } from 'element-plus'
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'
import request from '../utils/request'
import { useRouter } from 'vue-router'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const imageUrl = ref('')
const imageFile = ref<File>()

const ratingForm = reactive({
  title: '',
  text: '',
  image: ''
})

const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度应在 2 到 50 个字符之间', trigger: 'blur' }
  ],
  text: [
    { required: true, message: '请输入描述', trigger: 'blur' },
    { min: 10, max: 500, message: '描述长度应在 10 到 500 个字符之间', trigger: 'blur' }
  ],
  image: [
    { required: true, message: '请上传图片', trigger: 'change' }
  ]
}

const showCropper = ref(false)
const cropperImage = ref('')
const cropperRef = ref()

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/')
  
  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  return true
}

const handleImageChange = (file: UploadUserFile) => {
  if (!file.raw) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    cropperImage.value = e.target?.result as string
    showCropper.value = true
  }
  reader.readAsDataURL(file.raw)
}

const handleCropImage = () => {
  if (!cropperRef.value) return
  
  cropperRef.value.getCropData((data: string) => {
    const base64Data = data.split(',')[1]
    const binaryData = atob(base64Data)
    const array = new Uint8Array(binaryData.length)
    for (let i = 0; i < binaryData.length; i++) {
      array[i] = binaryData.charCodeAt(i)
    }
    const blob = new Blob([array], { type: 'image/jpeg' })
    
    if (blob.size / 1024 / 1024 > 2) {
      ElMessage.error('裁剪后的图片大小不能超过 2MB')
      return
    }
    
    imageUrl.value = data
    imageFile.value = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' })
    ratingForm.image = 'cropped-image.jpg'
    showCropper.value = false
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      if (!imageFile.value) {
        ElMessage.error('请选择图片')
        return
      }

      loading.value = true
      try {
        const formData = new FormData()
        formData.append('title', ratingForm.title)
        formData.append('text', ratingForm.text)
        formData.append('image', imageFile.value)

        await request({
          url: '/rating/create',
          method: 'post',
          data: formData,
          headers: {
            'Token': localStorage.getItem('token'),
            'Content-Type': 'multipart/form-data'
          }
        })
        ElMessage.success('评分创建成功')
        router.push('/')
      } catch (error) {
        ElMessage.error('评分创建失败，请重试')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleDeleteImage = (e: Event) => {
  e.stopPropagation()
  imageUrl.value = ''
  imageFile.value = undefined
  ratingForm.image = ''
}
</script>

<style scoped>
.create-rating-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.create-rating-box {
  width: 600px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  color: #409EFF;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: bold;
}

.rating-form {
  margin-top: 20px;
}

.image-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  width: 100%;
  transition: border-color 0.3s;
 display: flex;
  justify-content: center;
  align-items: center;
}

.image-upload:hover {
  border-color: #409EFF;
}

.upload-content {
  width: 100%;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  width: 100%;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
  margin-bottom: 8px;
}

.upload-text {
  color: #8c939d;
  font-size: 14px;
}

.image-preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.preview-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.image-info {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 4px;
}

.image-name {
  flex: 1;
  font-size: 14px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

:deep(.el-button.is-circle) {
  flex-shrink: 0;
}

:deep(.el-tooltip__trigger) {
  display: block;
  width: 100%;
}

.submit-btn {
  width: 100%;
  margin-top: 20px;
  height: 40px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input__wrapper) {
  background-color: #f5f7fa;
}

.cropper-container {
  height: 400px;
  width: 100%;
  margin: 0 auto;
}

:deep(.vue-cropper) {
  height: 100%;
  width: 100%;
}

:deep(.el-button.is-circle) {
  width: 32px;
  height: 32px;
  padding: 8px;
}
</style> 