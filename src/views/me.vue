<template>
  <div class="me-container">
    <el-card class="user-info-card">
      <template #header>
        <div class="card-header">
          <h2>个人信息</h2>
          <el-button type="danger" @click="handleLogout">退出登录</el-button>
        </div>
      </template>
      
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
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserInfo, logout } from '../api/user'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

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
    // 如果获取用户信息失败，可能是token过期，跳转到登录页
    router.push('/login')
  }
}

const handleLogout = async () => {
  try {
    await logout()
    // 清除本地token
    localStorage.removeItem('token')
    // 跳转到登录页
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
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.user-info-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-descriptions__label) {
  width: 100px;
  justify-content: center;
}
</style> 