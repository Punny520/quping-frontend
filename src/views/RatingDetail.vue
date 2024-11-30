<template>
  <div class="rating-detail">
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
              {{ ratingDetail.count }} 人评分
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
            <template v-if="ratingDetail.myScore">
              <el-rate
                v-model="ratingDetail.myScore"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value}"
              />
            </template>
            <template v-else>
              <span class="no-rating">暂未评分</span>
            </template>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getRatingDetail } from '../api/rating'
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
        score: Number(res.data.data.score) / 100
      }
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
</script>

<style scoped>
.rating-detail {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.detail-card {
  margin-top: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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
}

.no-rating {
  color: #909399;
  font-size: 1rem;
}
</style> 