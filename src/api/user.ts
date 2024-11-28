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