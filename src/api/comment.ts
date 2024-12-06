import request from '../utils/request'

// 发送评论
export const postComment = (ratingId: number, content: string) => {
  return request({
    url: '/comment/post',
    method: 'post',
    data: {
      ratingId,
      content
    }
  })
}

// 获取评论列表
export const getCommentList = (ratingId: number) => {
  return request({
    url: `/comment/list/${ratingId}`,
    method: 'get'
  })
} 