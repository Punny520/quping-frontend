<template>
  <div class="me-container">
    <div class="content-wrapper">
      <el-card class="user-info-card">
        <template #header>
          <div class="card-header">
            <h2>个人信息</h2>
            <div class="header-buttons">
              <el-button 
                type="primary" 
                @click="handleCreateRating"
                :icon="Plus"
              >
                创建评分
              </el-button>
              <el-button 
                type="danger" 
                @click="handleLogout"
                :icon="SwitchButton"
              >
                退出登录
              </el-button>
            </div>
          </div>
        </template>
        
        <div class="user-info-content">
          <el-avatar 
            :size="80" 
            class="user-avatar"
          >
            {{ userInfo.nickName?.charAt(0)?.toUpperCase() }}
          </el-avatar>
          
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户ID">
              {{ userInfo.id }}
            </el-descriptions-item>
            <el-descriptions-item label="昵称">
              {{ userInfo.nickName }}
            </el-descriptions-item>
            <el-descriptions-item label="手机号">
              {{ userInfo.phoneNumber }}
            </el-descriptions-item>
            <el-descriptions-item label="邮箱">
              {{ userInfo.email || '未设置' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserInfo, logout } from '../api/user'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { Plus, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()

interface UserInfo {
  id: number
  nickName: string
  phoneNumber: string
  email: string
}

const userInfo = ref<UserInfo>({
  id: 0,
  nickName: '',
  phoneNumber: '',
  email: ''
})

const fetchUserInfo = async () => {
  try {
    const res = await getUserInfo()
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

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.me-container {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40px 20px;
}

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

.user-info-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: #409EFF;
  font-size: 24px;
}

.header-buttons {
  display: flex;
  gap: 12px;
}

.user-info-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.user-avatar {
  background: #409EFF;
  font-size: 32px;
  font-weight: bold;
}

:deep(.el-descriptions) {
  width: 100%;
}

:deep(.el-descriptions__label) {
  width: 100px;
  justify-content: center;
  background-color: #f5f7fa;
}

:deep(.el-descriptions__content) {
  padding: 12px 24px;
}

:deep(.el-button) {
  padding: 12px 20px;
  font-weight: 500;
}

:deep(.el-card__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-card__body) {
  padding: 24px;
}
</style> 