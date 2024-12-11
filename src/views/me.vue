<template>
  <div class="me-container">
    <div class="content-wrapper">
      <!-- 将导航栏移到内容区域内 -->
      <div class="nav-bar">
        <div class="nav-content">
          <div class="nav-title">个人主页</div>
          <el-button 
            class="back-button" 
            :icon="ArrowLeft"
            @click="router.push('/')"
            text
          />
        </div>
      </div>

      <div class="profile-wrapper">
        <!-- 背景图片 -->
        <div class="profile-header">
          <img src="https://picsum.photos/800/200" alt="背景图片" class="header-image" />
        </div>

        <!-- 个人信息区域 -->
        <div class="profile-info">
          <div class="avatar-container">
            <el-avatar 
              :size="120" 
              class="user-avatar"
              :src="userInfo.avatarUrl || defaultAvatar"
            >
              {{ userInfo.nickName?.charAt(0)?.toUpperCase() }}
            </el-avatar>
          </div>

          <div class="info-actions">
            <el-button 
              class="edit-profile-btn"
              round
              @click="handleEditProfile"
            >
              编辑个人资料
            </el-button>
          </div>

          <div class="user-details">
            <h2 class="user-name">{{ userInfo.nickName }}</h2>
            <p class="user-id">@{{ userInfo.id }}</p>
            <p class="user-bio">{{ userInfo.description || '这个人很懒，还没有写简介' }}</p>
            
            <div class="user-stats">
              <div class="stat-item">
                <span class="stat-count">58</span>
                <span class="stat-label">正在关注</span>
              </div>
              <div class="stat-item">
                <span class="stat-count">128</span>
                <span class="stat-label">关注者</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 导航栏 -->
        <div class="profile-nav">
          <div class="nav-items">
            <div class="nav-item active">评分</div>
            <div class="nav-item">点赞</div>
            <div class="nav-item">收藏</div>
            <div class="nav-item">文章</div>
          </div>
        </div>

        <!-- 内容区域（示例） -->
        <div class="profile-content">
          <div class="empty-content">
            <el-icon class="empty-icon"><Star /></el-icon>
            <p>还没有发布任何评分</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button 
        type="primary" 
        @click="handleCreateRating"
        :icon="Plus"
        round
      >
        创建评分
      </el-button>
      <el-button 
        type="danger" 
        @click="handleLogout"
        :icon="SwitchButton"
        round
      >
        退出登录
      </el-button>
    </div>

    <!-- 添加编辑个人资料的 Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :show-close="false"
      :close-on-click-modal="false"
      class="edit-profile-dialog"
    >
      <!-- 自定义header -->
      <div class="dialog-header">
        <el-button 
          class="close-button" 
          @click="dialogVisible = false"
          text
        >
          <el-icon><Close /></el-icon>
        </el-button>
        <span class="dialog-title">编辑个人资料</span>
        <el-button 
          class="save-button" 
          @click="handleSaveProfile"
          text
        >
          保存
        </el-button>
      </div>

      <div class="dialog-content">
        <!-- 背景图片上传 -->
        <div class="background-upload">
          <img 
            src="https://picsum.photos/800/200" 
            alt="背景图片" 
            class="background-image" 
          />
          <div class="upload-overlay">
            <el-icon class="upload-icon"><Camera /></el-icon>
          </div>
        </div>

        <!-- 头像上�� -->
        <div class="avatar-upload">
          <el-avatar 
            :size="80" 
            class="user-avatar"
            :src="editForm.avatarPreview || userInfo.avatarUrl || defaultAvatar"
          >
            {{ userInfo.nickName?.charAt(0)?.toUpperCase() }}
          </el-avatar>
          <div class="upload-icon-wrapper" @click="triggerFileInput">
            <el-icon class="camera-icon"><Plus /></el-icon>
          </div>
          <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" style="display: none;" />
        </div>

        <!-- 表单区域 -->
        <div class="form-section">
          <div class="form-item">
            <div class="form-label">全名</div>
            <el-input 
              v-model="editForm.nickName" 
              placeholder="请输入您的名字"
            />
          </div>
          <div class="form-item">
            <div class="form-label">简介</div>
            <el-input
              v-model="editForm.description"
              type="textarea"
              :rows="3"
              placeholder="介绍一下自己吧"
            />
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog
      v-model="showAvatarCropper"
      title="裁剪头像"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="cropper-container">
        <VueCropper
          ref="avatarCropperRef"
          :img="avatarCropperImage"
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
          :canMove="true"
          :canMoveBox="true"
          :canScale="true"
        />
      </div>
      <template #footer>
        <el-button @click="showAvatarCropper = false">取消</el-button>
        <el-button type="primary" @click="handleCropAvatar">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { Plus, SwitchButton, Star, ArrowLeft, Camera, Close } from '@element-plus/icons-vue'
import { VueCropper } from 'vue-cropper'
import request from '../utils/request'

const router = useRouter()

interface UserInfo {
  id: number
  nickName: string
  phoneNumber: string
  email: string | null
  avatarUrl: string
  description: string
  firstLogin: boolean
  createTime: string
  updateTime: string
  deleted: boolean
}

const defaultAvatar = 'path/to/default/avatar.png'

const userInfo = ref<UserInfo>({
  id: 0,
  nickName: '',
  phoneNumber: '',
  email: null,
  avatarUrl: '',
  description: '',
  firstLogin: false,
  createTime: '',
  updateTime: '',
  deleted: false
})

const editForm = ref({
  nickName: '',
  description: '',
  avatarPreview: '',
  avatarFile: null as File | null
})

const fetchUserInfo = async () => {
  try {
    const res = await request.get('/user/me')
    if (res.data.code === '1') {
      userInfo.value = res.data.data
    } else {
      ElMessage.error(res.data.msg || '获取用户信息失败')
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败')
    router.push('/login')
  }
}

const handleCreateRating = () => {
  router.push('/rating/create')
}

const handleLogout = async () => {
  try {
    await logout()
    localStorage.removeItem('token')
    router.push('/login')
    ElMessage.success('退出登录成功')
  } catch (error) {
    ElMessage.error('退出登录失败')
  }
}

const dialogVisible = ref(false)

const handleEditProfile = () => {
  editForm.value.nickName = userInfo.value.nickName
  editForm.value.description = userInfo.value.description
  editForm.value.avatarPreview = ''
  editForm.value.avatarFile = null
  dialogVisible.value = true
}

const handleSaveProfile = async () => {
  try {
    const formData = new FormData()
    if (editForm.value.avatarFile) {
      formData.append('avatarFile', editForm.value.avatarFile)
    }
    formData.append('nickName', editForm.value.nickName)
    formData.append('description', editForm.value.description)

    const res = await request.post('/user/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (res.data.code === '1') {
      ElMessage.success('保存成功')
      dialogVisible.value = false
      await fetchUserInfo()
    } else {
      ElMessage.error(res.data.msg || '保存失败')
    }
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const handleAvatarChange = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarCropperImage.value = e.target?.result as string
    showAvatarCropper.value = true
  }
  reader.readAsDataURL(file)
}

const showAvatarCropper = ref(false)
const avatarCropperImage = ref('')
const avatarCropperRef = ref()

const handleCropAvatar = () => {
  if (!avatarCropperRef.value) return

  avatarCropperRef.value.getCropData((data: string) => {
    const base64Data = data.split(',')[1]
    const binaryData = atob(base64Data)
    const array = new Uint8Array(binaryData.length)
    for (let i = 0; i < binaryData.length; i++) {
      array[i] = binaryData.charCodeAt(i)
    }
    const blob = new Blob([array], { type: 'image/jpeg' })

    if (blob.size / 1024 / 1024 > 2) {
      ElMessage.error('裁剪后的头像大小不能超过 2MB')
      return
    }

    editForm.value.avatarPreview = URL.createObjectURL(blob)
    editForm.value.avatarFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })

    showAvatarCropper.value = false
  })
}

const fileInput = ref<HTMLInputElement | null>(null)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    handleAvatarChange(file)
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.me-container {
  min-height: 100vh;
  width: 100%;
  min-width: 320px;
  background-color: #f0f2f5;
  padding: 0;
}

.content-wrapper {
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
}

.nav-bar {
  width: 100%;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.nav-content {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: relative;
}

.nav-title {
  font-size: 16px;
  font-weight: bold;
  flex: 1;
  text-align: center;
}

.back-button {
  font-size: 20px;
  position: absolute;
  left: 16px;
}

.profile-wrapper {
  width: 100%;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.profile-header {
  height: 200px;
  width: 100%;
  overflow: hidden;
  background-color: #f0f2f5;
}

.header-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  min-height: 200px;
  display: block;
}

.profile-info {
  padding: 0 16px;
  position: relative;
}

.avatar-container {
  position: absolute;
  top: -60px;
  left: 16px;
}

.user-avatar {
  border: 4px solid #fff;
  background: #1da1f2;
  font-size: 48px;
  font-weight: bold;
}

.info-actions {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
}

.edit-profile-btn {
  font-weight: bold;
}

.user-details {
  padding: 12px 0;
}

.user-name {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}

.user-id {
  margin: 4px 0;
  color: #536471;
}

.user-bio {
  margin: 12px 0;
  font-size: 15px;
}

.user-stats {
  display: flex;
  gap: 20px;
  margin-top: 12px;
}

.stat-item {
  display: flex;
  gap: 4px;
  color: #536471;
}

.stat-count {
  font-weight: bold;
  color: #000;
}

.profile-nav {
  margin-top: 16px;
  border-bottom: 1px solid #eee;
}

.nav-items {
  display: flex;
  justify-content: space-around;
}

.nav-item {
  padding: 16px 0;
  font-weight: bold;
  color: #536471;
  cursor: pointer;
  position: relative;
}

.nav-item.active {
  color: #000;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: #1da1f2;
  border-radius: 4px;
}

.profile-content {
  min-height: 300px;
  padding: 32px 16px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #536471;
  padding: 40px 0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.action-buttons {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 600px) {
  .user-avatar {
    width: 80px;
    height: 80px;
    font-size: 32px;
  }

  .avatar-container {
    top: -40px;
  }
}

.edit-profile-dialog {
  :deep(.el-dialog) {
    margin: 0 auto;
    width: 100%;
    max-width: 450px;
    border-radius: 0;
    overflow: hidden;
  }

  :deep(.el-dialog__header) {
    display: none;
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.dialog-title {
  font-size: 16px;
  font-weight: 500;
}

.close-button, .save-button {
  font-size: 16px;
  height: 32px;
  padding: 0 4px;
}

.save-button {
  color: #1a73e8;
}

.background-upload {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  color: white;
  font-size: 20px;
}

.avatar-upload {
  position: relative;
  margin: -40px 16px 16px;
  width: fit-content;
}

.upload-icon-wrapper {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s;
}

.upload-icon-wrapper:hover {
  background: rgba(0, 0, 0, 0.8);
}

.camera-icon {
  color: white;
  font-size: 16px;
}

.form-section {
  padding: 16px;
}

.form-item {
  margin-bottom: 24px;
}

.form-label {
  color: #666;
  margin-bottom: 8px;
  font-size: 14px;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: none;
}

:deep(.el-input__inner) {
  height: 40px;
}

:deep(.el-textarea__inner) {
  padding: 8px 12px;
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

:deep(.cropper-view-box) {
  border-radius: 50%;
}

:deep(.cropper-face) {
  border-radius: 50%;
}
</style>