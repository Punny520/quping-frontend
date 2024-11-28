export interface ApiResponse<T = any> {
  code: string
  msg: string
  data: T
}

export interface LoginParams {
  code?: string
  email?: string
  phoneNumber?: string
  password?: string
} 