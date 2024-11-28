<template>
  <div class="rating-card" @click="goToDetail">
    <el-card :body-style="{ padding: '0px' }" shadow="hover">
      <div class="card-layout">
        <img :src="rating.imageUrl" class="card-image" />
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
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'

interface Rating {
  id: number
  imageUrl: string
  score: number
  title: string
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
  align-items: center;
}

.card-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
}

.card-content {
  flex: 1;
  padding: 12px;
}

.title {
  margin: 0;
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.score-container {
  display: flex;
  align-items: center;
}

:deep(.el-rate) {
  height: 20px;
  line-height: 20px;
}

:deep(.el-rate__icon) {
  font-size: 14px;
  margin-right: 2px;
}
</style> 