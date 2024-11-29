import request from '../utils/request'

// 获取评分详情
export const getRatingDetail = (id: number) => {
  return request({
    url: `/rating/show/${id}`,
    method: 'get',
    headers: {
      'Token': localStorage.getItem('token')
    }
  })
}

interface PageParams {
  pageNumber: number
  pageSize: number
}

// 分页获取评分列表
export const getRatingList = (params: PageParams) => {
  return request({
    url: '/rating/page',
    method: 'post',
    data: params,
    headers: {
      'Token': localStorage.getItem('token')
    }
  })
}

// 添加获取总记录数的方法
export const getRatingTotal = () => {
  return request({
    url: '/rating/total',
    method: 'get',
    headers: {
      'Token': localStorage.getItem('token')
    }
  })
} 