<template>
  <el-dialog
    v-model="showFirstLoginDialog"
    title="首次登录设置"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    width="400px"
  >
    <el-form
      ref="formRef"
      :model="firstLoginForm"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="昵称" prop="nickName">
        <el-input v-model="firstLoginForm.nickName" placeholder="请输入昵称" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="firstLoginForm.password"
          type="password"
          placeholder="请设置密码"
          show-password
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="handleFirstLoginSubmit" :loading="isSubmitting">
        确认
      </el-button>
    </template>
  </el-dialog>

  <div class="home-container">
    <div class="fixed-header">
      <!-- 添加顶部导航栏 -->
      <div class="nav-bar">
        <div class="nav-placeholder"></div> <!-- 用于保持标题居中 -->
        <div class="title-section">
          <h1 class="main-title">QuPing</h1>
          <p class="subtitle">发现、评价、分享</p>
        </div>
        <div class="nav-right">
          <el-button
            class="avatar-button"
            @click="router.push('/me')"
            type="text"
          >
            <el-avatar 
              :size="32"
              class="user-avatar"
            >
              <el-icon><User /></el-icon>
            </el-avatar>
            <span class="nav-text">个人中心</span>
          </el-button>
        </div>
      </div>

      <!-- 搜索区域 -->
      <div class="search-section">
        <el-input
          v-model="searchQuery"
          placeholder="搜索你感兴趣的内容..."
          class="search-input"
          :prefix-icon="Search"
        >
          <template #append>
            <el-button :icon="Search">搜索</el-button>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <div class="rating-list">
        <div v-if="ratingList.length === 0" class="empty-state">
          暂无数据
        </div>
        <div v-else class="rating-grid">
          <rating-card
            v-for="rating in ratingList"
            :key="rating.id"
            :rating="rating"
          />
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 40]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search, User } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { getRatingList, getRatingTotal } from '../api/rating'
import RatingCard from '../components/RatingCard.vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import request from '../utils/request'

const router = useRouter()
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const ratingList = ref([])

// 首次登录相关的状态
const showFirstLoginDialog = ref(false)
const isSubmitting = ref(false)
const formRef = ref<FormInstance>()
const firstLoginForm = ref({
  nickName: '',
  password: ''
})

// 表单验证规则
const rules = {
  nickName: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度应在 2 到 20 个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在 6 到 20 个字符之间', trigger: 'blur' }
  ]
}

// 使用新的 API 方法
const getTotalCount = async () => {
  try {
    const res = await getRatingTotal()
    console.log('获取总数响应:', res)
    total.value = parseInt(res.data)
    console.log('设置总数:', total.value)
  } catch (error) {
    console.error('获取总数错误:', error)
    ElMessage.error('获取总记录数失败')
  }
}

const fetchRatingList = async () => {
  try {
    const res = await getRatingList({
      pageNumber: currentPage.value,
      pageSize: pageSize.value
    })
    
    if (res.data.code === '1') {
      ratingList.value = res.data.data
      console.log('获取列表数据:', ratingList.value) // 添加调试日志
    } else {
      ElMessage.error(res.data.msg || '获取数据失败')
    }
  } catch (error) {
    console.error('获取列表错误:', error) // 添加错误日志
    ElMessage.error('获取数据失败')
  }
}

const handleSizeChange = async (val: number) => {
  console.log('改变每页数量:', val) // 添加调试日志
  pageSize.value = val
  currentPage.value = 1
  await getTotalCount()
  await fetchRatingList()
}

const handleCurrentChange = async (val: number) => {
  console.log('改变当前页:', val) // 添加调试日志
  currentPage.value = val
  await fetchRatingList()
}

// 检查是否是首次登录
const checkFirstLogin = async () => {
  try {
    const res = await request({
      url: '/user/check',
      method: 'get'
    })
    
    if (res.data.code === '1' && res.data.data === true) {
      showFirstLoginDialog.value = true
    }
  } catch (error) {
    ElMessage.error('检查登录状态失败')
  }
}

// 提交首次登录设置
const handleFirstLoginSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        isSubmitting.value = true
        const res = await request({
          url: '/user/firstSetting',
          method: 'post',
          data: firstLoginForm.value
        })
        
        if (res.data.code === '1') {
          ElMessage.success('设置成功')
          showFirstLoginDialog.value = false
          // 重新加载页面数据
          await getTotalCount()
          await fetchRatingList()
          return  // 添加 return 语句，防止继续执行
        }
        // 如果不是成功状态，显示错误信息
        ElMessage.error(res.data.msg || '设置失败')
      } catch (error) {
        ElMessage.error('设置失败')
      } finally {
        isSubmitting.value = false
      }
    }
  })
}

onMounted(async () => {
  console.log('组件挂载，开始获取数据') // 添加调试日志
  await checkFirstLogin()
  await getTotalCount()
  await fetchRatingList()
})
</script>

<style scoped>
.home-container {
  height: 100vh;
  width: 800px;
  display: flex;
  flex-direction: column;
  background-color: white;
  flex-shrink: 0;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
}

.fixed-header {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
  padding: 30px 0;
  border-bottom: 1px solid #e8f0fe;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  margin-bottom: 25px;
  height: 60px;
}

.nav-placeholder {
  width: 100px;
  height: 40px;
}

.nav-right {
  width: 100px;
  height: 40px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.avatar-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.3s ease;
  height: auto;
}

.avatar-button:hover {
  background-color: #f0f7ff;
}

.user-avatar {
  background-color: #1a73e8;
  color: white;
}

.nav-text {
  font-size: 14px;
  color: #1a73e8;
  font-weight: 500;
}

.title-section {
  text-align: center;
  margin: 0;
  padding-top: 0;
}

.main-title {
  font-size: 36px;
  color: #1a73e8;
  margin: 0 0 4px 0;
  font-weight: 600;
  letter-spacing: 1px;
  line-height: 1.2;
}

.subtitle {
  font-size: 14px;
  color: #5f6368;
  letter-spacing: 0.5px;
  margin: 0;
  line-height: 1.2;
}

.search-section {
  margin-top: 20px;
  padding: 0 30px;
}

.search-input :deep(.el-input-group__append) {
  background-color: #1a73e8;
  border-color: #1a73e8;
  color: white;
  transition: all 0.3s ease;
  border-radius: 8px;
  margin-left: 8px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid #dcdfe6;
}

.search-input :deep(.el-input__wrapper:focus-within) {
  border-radius: 8px;
}

.search-input :deep(.el-input-group__append .el-button) {
  border: none;
  color: white;
  height: 100%;
  border-radius: 8px;
}

.search-input :deep(.el-input-group__append:hover) {
  background-color: #1557b0;
  border-color: #1557b0;
}

.search-input :deep(.el-input__wrapper:focus-within) + .el-input-group__append {
  border-radius: 8px;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  background-color: #ffffff;
}

.content-area::-webkit-scrollbar {
  display: none;
}

.rating-list {
  padding: 20px 30px;
  background-color: #ffffff;
}

.rating-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #ffffff;
}

.empty-state {
  text-align: center;
  color: #5f6368;
  padding: 60px 0;
  font-size: 14px;
}

.pagination-section {
  display: flex;
  justify-content: center;
  padding: 30px 0;
  border-top: 1px solid #e8f0fe;
}

:deep(.el-input-group__append) {
  background-color: #1a73e8;
  border-color: #1a73e8;
  color: white;
  transition: all 0.3s ease;
}

:deep(.el-input-group__append .el-button) {
  color: white;
  border: none;
  font-weight: 500;
}

:deep(.el-input-group__append:hover) {
  background-color: #1557b0;
  border-color: #1557b0;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #1a73e8;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled):hover) {
  color: #1a73e8;
}

:deep(.el-input__wrapper:focus-within) {
  box-shadow: 0 0 0 1px #1a73e8 !important;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active:hover) {
  color: white;
}

:deep(.el-select-dropdown__item.selected) {
  color: #1a73e8;
}

:deep(.el-pagination .btn-next:hover, .el-pagination .btn-prev:hover) {
  color: #1a73e8;
}

:deep(.el-button.is-text) {
  padding: 0;
}

:deep(.el-button.is-text:hover) {
  background-color: transparent;
}

:deep(.el-dialog__header) {
  margin-right: 0;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-dialog__body) {
  padding: 30px 20px;
}

:deep(.el-dialog__footer) {
  padding: 20px;
  border-top: 1px solid #f0f0f0;
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
}
</style> 