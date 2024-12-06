import request from '@/utils/request'

export function postComment(ratingId, content) {
  return request({
    url: '/comment/post',
    method: 'post',
    data: {
      ratingId,
      content
    }
  })
}

export function getCommentList(ratingId) {
  return request({
    url: `/comment/list/${ratingId}`,
    method: 'get'
  })
}

export function likeComment(commentId) {
  return request({
    url: `/comment/like/${commentId}`,
    method: 'get'
  })
} 