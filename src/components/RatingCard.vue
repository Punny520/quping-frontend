<template>
  <div class="rating-card" @click="goToDetail">
    <el-card :body-style="{ padding: '8px' }" shadow="hover">
      <div class="card-layout">
        <el-image 
          :src="rating.imageUrl" 
          class="card-image"
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
        <div class="card-content">
          <h3 class="title">{{ rating.title }}</h3>
          <div class="score-container">
            <el-rate
              v-model="rating.score"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value}"
            />
          </div>
          <div class="description">
            {{ rating.text }}
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { Picture, Loading } from '@element-plus/icons-vue'

interface Rating {
  id: number
  imageUrl: string
  score: number
  title: string
  text: string
}

const props = defineProps<{
  rating: Rating
}>()

const router = useRouter()

const goToDetail = () => {
  router.push(`/rating/${props.rating.id}`)
}
</script>

<style scoped>
.rating-card {
  width: 100%;
  cursor: pointer;
  transition: transform 0.2s;
}

.rating-card:hover {
  transform: translateY(-2px);
}

.card-layout {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.card-image {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
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
  font-size: 12px;
  background-color: #f5f7fa;
}

.image-error .el-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.loading-icon {
  font-size: 20px;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.card-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.score-container {
  display: flex;
  align-items: center;
}

.description {
  font-size: 12px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

:deep(.el-rate) {
  height: 18px;
  line-height: 18px;
}

:deep(.el-rate__icon) {
  font-size: 14px;
  margin-right: 2px;
}

:deep(.el-card__body) {
  padding: 8px !important;
}
</style> 