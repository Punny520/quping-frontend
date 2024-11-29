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
            <img v-if="imageUrl" :src="imageUrl" class="preview-image" />
            <el-icon v-else class="upload-icon"><Plus /></el-icon>
            <div class="upload-text">{{ imageUrl ? '点击更换图片' : '点击上传图片' }}</div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, UploadProps, UploadUserFile } from 'element-plus'
import { ElMessage } from 'element-plus'
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

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }
  return true
}

const handleImageChange = (file: UploadUserFile) => {
  imageFile.value = file.raw
  imageUrl.value = URL.createObjectURL(file.raw!)
  ratingForm.image = file.raw?.name || ''
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
        // 创建 FormData 对象
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
  overflow: hidden;
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: border-color 0.3s;
}

.image-upload:hover {
  border-color: #409EFF;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
}

.upload-text {
  color: #8c939d;
  margin-top: 8px;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
</style> 