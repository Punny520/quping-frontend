<template>
  <el-card class="detail-card">
    <div class="card-header">
      <el-button type="primary" @click="goBack">返回</el-button>
    </div>

    <div class="header-section">
      <div class="image-section">
        <el-image 
          :src="ratingDetail.imageUrl" 
          class="detail-image"
          fit="cover"
        >
          <template #error>
            <div class="image-error">
              <el-icon><Picture /></el-icon>
              <span>加载失败</span>
            </div>
          </template>
          <template #placeholder>
            <div class="image-placeholder">
              <el-icon class="loading-icon"><Loading /></el-icon>
            </div>
          </template>
        </el-image>
      </div>
      <div class="title-section">
        <h2>{{ ratingDetail.title }}</h2>
        <div class="rating-summary">
          <div class="average-score">
            <span class="score-number">{{ ratingDetail.score.toFixed(1) }}</span>
            <el-rate
              v-model="ratingDetail.score"
              disabled
              show-score
              text-color="#ff9900"
              score-template=""
            />
          </div>
          <div class="rating-count">
            {{ ratingDetail.count > 0 ? `${ratingDetail.count} 人评分` : '暂无人评分' }}
          </div>
        </div>
      </div>
    </div>

    <div class="content">
      <div class="description-section">
        <h3>详细描述</h3>
        <div class="description-text">
          {{ ratingDetail.text }}
        </div>
      </div>

      <div class="my-rating-section">
        <h3>我的评分</h3>
        <div class="my-rating-content">
          <el-rate
            v-model="myRatingScore"
            :disabled="isSubmitting"
            show-score
            text-color="#ff9900"
            score-template="{value}"
            @change="handleRatingChange"
          />
          <div class="rating-tip" v-if="!ratingDetail.myScore">
            <span class="tip-text">点击星星进行评分</span>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getRatingDetail, doRating } from '../api/rating'
import { ElMessage } from 'element-plus'
import { Picture, Loading } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

interface RatingDetail {
  id: number
  imageUrl: string
  score: number
  title: string
  text: string
  count: number
  myScore: number | null
  createBy: string | null
}

const ratingDetail = ref<RatingDetail>({
  id: 0,
  imageUrl: '',
  score: 0,
  title: '',
  text: '',
  count: 0,
  myScore: null,
  createBy: null
})

const fetchRatingDetail = async () => {
  try {
    const id = Number(route.params.id)
    const res = await getRatingDetail(id)
    if (res.data.code === '1') {
      ratingDetail.value = {
        ...res.data.data,
        score: Number(res.data.data.score)
      }
      initMyRating()
    } else {
      ElMessage.error(res.data.msg || '获取评分详情失败')
    }
  } catch (error) {
    ElMessage.error('获取评分详情失败')
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchRatingDetail()
})

const myRatingScore = ref(0)
const isSubmitting = ref(false)

const handleRatingChange = async (value: number) => {
  console.log('评分变化:', value)
  if (isSubmitting.value) return

  try {
    isSubmitting.value = true
    const res = await doRating(ratingDetail.value.id, Math.round(value))
    console.log('评分响应:', res)

    if (res.data.code === '1') {
      ElMessage.success('评分成功')
      await fetchRatingDetail()
    } else {
      ElMessage.error(res.data.msg || '评分失败')
      myRatingScore.value = ratingDetail.value.myScore || 0
    }
  } catch (error) {
    console.error('评分错误:', error)
    ElMessage.error('评分失败')
    myRatingScore.value = ratingDetail.value.myScore || 0
  } finally {
    isSubmitting.value = false
  }
}

const initMyRating = () => {
  myRatingScore.value = ratingDetail.value.myScore || 0
}
</script>

<style scoped>
.detail-card {
  min-height: 100vh;
  height: auto;
  max-width: 800px;
  margin: 20px auto;
  background-color: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

/* 为 Webkit 浏览器（Chrome、Safari）隐藏滚动条 */
.detail-card::-webkit-scrollbar {
  display: none;
}

:deep(.el-card__body) {
  height: 100%;
  padding: 20px;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

:deep(.el-card__body::-webkit-scrollbar) {
  display: none;
}

.card-header {
  text-align: right;
  padding: 0 20px 20px;
}

.header-section {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  padding: 0 20px;
}

.image-section {
  flex: 0 0 200px;
  width: 200px;
  height: 200px;
  background-color: #f5f7fa;
  border-radius: 8px;
  overflow: hidden;
}

.detail-image {
  width: 100%;
  height: 100%;
}

.image-error,
.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
  font-size: 14px;
  background-color: #f5f7fa;
}

.image-error .el-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.loading-icon {
  font-size: 24px;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.title-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 10px 0;
}

.title-section h2 {
  margin: 0;
  font-size: 1.8rem;
  color: #303133;
}

.rating-summary {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
}

.average-score {
  margin-bottom: 10px;
}

.score-number {
  font-size: 2rem;
  font-weight: bold;
  color: #ff9900;
  margin-right: 10px;
}

.rating-count {
  color: #909399;
  font-size: 0.9rem;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 20px 20px;
}

.description-section,
.my-rating-section {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
}

h3 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 1.1rem;
}

.description-text {
  line-height: 1.6;
  color: #606266;
}

.my-rating-content {
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-tip {
  font-size: 12px;
  color: #909399;
}

.tip-text {
  margin-left: 4px;
}

:deep(.el-rate) {
  display: inline-flex;
  align-items: center;
}

:deep(.el-rate__icon) {
  font-size: 20px;
  margin-right: 4px;
}

:deep(.el-rate__text) {
  font-size: 14px;
  color: #ff9900;
}
</style> 