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

      <div class="comment-section">
        <h3>评论</h3>
        
        <div class="comment-input-area">
          <el-input
            v-model="commentContent"
            type="textarea"
            :rows="2"
            placeholder="写下你的评论..."
            :maxlength="200"
            show-word-limit
          />
          <el-button 
            type="primary" 
            @click="submitComment"
            :loading="isSubmitting"
            :disabled="!commentContent.trim()"
          >
            发送评论
          </el-button>
        </div>

        <div class="comment-list">
          <div v-if="comments.length === 0" class="no-comments">
            暂无评论，来说说你的看法吧
          </div>
          <div v-else class="comment-items">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <div class="comment-content">{{ comment.content }}</div>
              <div class="comment-meta">
                <span class="like-count">
                  <el-icon><Star /></el-icon>
                  {{ comment.likeCount }}
                </span>
                <span class="comment-time">
                  {{ formatTime(comment.createTime) }}
                </span>
              </div>
            </div>
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
import { Picture, Loading, Thumb } from '@element-plus/icons-vue'
import { postComment, getCommentList } from '../api/comment'

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
  fetchComments()
})

const myRatingScore = ref(0)
const isSubmitting = ref(false)

const handleRatingChange = async (value: number) => {
  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  try {
    isSubmitting.value = true
    const res = await doRating(ratingDetail.value.id, value)
    if (res.data.code === '1') {
      ElMessage.success('评分成功')
      await fetchRatingDetail()
    } else {
      ElMessage.error(res.data.msg || '评分失败')
    }
  } catch (error) {
    ElMessage.error('评分失败')
  } finally {
    isSubmitting.value = false
  }
}

const initMyRating = () => {
  myRatingScore.value = ratingDetail.value.myScore || 0
}

const commentContent = ref('')
const comments = ref([])

const fetchComments = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    return
  }

  try {
    const res = await getCommentList(Number(route.params.id))
    if (res.data.code === '1') {
      comments.value = res.data.data
    }
  } catch (error) {
    console.error('获取评论失败:', error)
  }
}

const submitComment = async () => {
  if (!commentContent.value.trim()) return
  
  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  try {
    isSubmitting.value = true
    const res = await postComment(Number(route.params.id), commentContent.value.trim())
    if (res.data.code === '1') {
      ElMessage.success('评论成功')
      commentContent.value = ''
      await fetchComments()
    } else {
      ElMessage.error(res.data.msg || '评论失败')
    }
  } catch (error) {
    console.error('提交评论失败:', error)
    ElMessage.error('评论失败')
  } finally {
    isSubmitting.value = false
  }
}

const formatTime = (timeStr: string) => {
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
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

.comment-section {
  margin-top: 30px;
  padding: 0 20px;
}

.comment-section h3 {
  margin-bottom: 20px;
  color: #303133;
  font-size: 1.1rem;
}

.comment-input-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.comment-input-area .el-button {
  align-self: flex-end;
  padding: 8px 24px;
}

.comment-list {
  margin-top: 20px;
}

.no-comments {
  text-align: center;
  color: #909399;
  padding: 30px 0;
  font-size: 14px;
}

.comment-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.comment-content {
  color: #303133;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 8px;
}

.comment-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.like-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.like-count .el-icon {
  font-size: 14px;
}

.comment-time {
  color: #c0c4cc;
}
</style> 