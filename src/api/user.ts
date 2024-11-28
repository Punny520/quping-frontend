import axios from 'axios'
import type { ApiResponse, LoginParams } from '../types/api'

const request = axios.create({
  baseURL: '/api'
})

export const getPhoneCode = (phoneNumber: string) => {
  return request.get<ApiResponse<string>>(`/user/getCodeByPhone?phoneNumber=${phoneNumber}`)
}

export const getEmailCode = (email: string) => {
  return request.get<ApiResponse<string>>(`/user/getCodeByEmail?email=${email}`)
}

export const login = (params: LoginParams) => {
  return request.post<ApiResponse<string>>('/user/doLogin', params)
}

// 获取用户信息
export const getUserInfo = () => {
  return request({
    url: '/user/me',
    method: 'get',
    headers: {
      'Token': localStorage.getItem('token')
    }
  })
}

// 登出
export const logout = () => {
  return request({
    url: '/user/loginOut',
    method: 'get',
    headers: {
      'Token': localStorage.getItem('token')
    }
  })
} 