<template>
  <div class="rating-detail">
    <el-card class="detail-card">
      <template #header>
        <div class="card-header">
          <h2>{{ ratingDetail.title }}</h2>
          <el-button @click="goBack">返回</el-button>
        </div>
      </template>

      <div class="content">
        <div class="image-container">
          <img :src="ratingDetail.imageUrl" class="detail-image" />
        </div>
        
        <div class="info-container">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="评分">
              <el-rate
                v-model="ratingDetail.score"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value}"
              />
            </el-descriptions-item>
            <el-descriptions-item label="评分人数">
              {{ ratingDetail.count }}
            </el-descriptions-item>
            <el-descriptions-item label="我的评分">
              {{ ratingDetail.myScore || '暂未评分' }}
            </el-descriptions-item>
            <el-descriptions-item label="描述">
              {{ ratingDetail.text }}
            </el-descriptions-item>
            <el-descriptions-item label="创建者">
              {{ ratingDetail.createBy || '未知' }}
            </el-descriptions-item>
          </el-descriptions>
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
      ratingDetail.value = res.data.data
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
  max-width: 1000px;
  margin: 0 auto;
}

.detail-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content {
  display: flex;
  gap: 30px;
}

.image-container {
  flex: 0 0 400px;
}

.detail-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.info-container {
  flex: 1;
}

:deep(.el-descriptions__label) {
  width: 120px;
  justify-content: center;
}
</style> 