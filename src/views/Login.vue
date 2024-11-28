<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="title">QuPing</h1>
      
      <el-tabs v-model="loginType" class="login-tabs">
        <el-tab-pane label="验证码登录" name="code">
          <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef">
            <el-form-item prop="account">
              <div class="account-input">
                <el-input 
                  v-model="loginForm.account"
                  :placeholder="accountType === 'phone' ? '请输入手机号' : '请输入邮箱'"
                  :prefix-icon="User"
                />
                <el-select v-model="accountType" class="account-type-select">
                  <el-option 
                    label="手机" 
                    value="phone"
                  />
                  <el-option 
                    label="邮箱" 
                    value="email"
                  />
                </el-select>
              </div>
            </el-form-item>
            
            <el-form-item prop="code">
              <div class="code-input">
                <el-input 
                  v-model="loginForm.code"
                  placeholder="请输入验证码"
                  :prefix-icon="Lock"
                />
                <el-button 
                  type="primary" 
                  class="send-code-btn"
                  @click="sendCode"
                  :disabled="isCountDown"
                >
                  {{ countDownText }}
                </el-button>
              </div>
            </el-form-item>
            
            <el-button type="primary" class="login-btn" @click="handleLogin">
              登录
            </el-button>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="密码登录" name="password">
          <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef">
            <el-form-item prop="account">
              <div class="account-input">
                <el-input 
                  v-model="loginForm.account"
                  :placeholder="accountType === 'phone' ? '请输入手机号' : '请输入邮箱'"
                  :prefix-icon="User"
                />
                <el-select v-model="accountType" class="account-type-select">
                  <el-option 
                    label="手机" 
                    value="phone"
                  />
                  <el-option 
                    label="邮箱" 
                    value="email"
                  />
                </el-select>
              </div>
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input 
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <el-button type="primary" class="login-btn" @click="handleLogin">
              登录
            </el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPhoneCode, getEmailCode, login } from '../api/user'

interface LoginForm {
  account: string
  code: string
  password: string
}

const loginType = ref('code')
const accountType = ref('phone')
const loginFormRef = ref<FormInstance>()
const countDown = ref(0)
const isCountDown = ref(false)

const loginForm = reactive<LoginForm>({
  account: '',
  code: '',
  password: ''
})

const validateAccount = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入账号'))
    return
  }
  
  if (accountType.value === 'phone') {
    // 手机号格式验证：1开头的11位数字
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(value)) {
      callback(new Error('请输入正确的手机号'))
      return
    }
  } else {
    // 邮箱格式验证
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
    if (!emailRegex.test(value)) {
      callback(new Error('请输入正确的邮箱地址'))
      return
    }
  }
  callback()
}

const loginRules = computed(() => ({
  account: [
    { required: true, validator: validateAccount, trigger: 'blur' }
  ],
  code: [
    { 
      required: loginType.value === 'code', 
      message: '请输入验证码', 
      trigger: 'blur' 
    }
  ],
  password: [
    { 
      required: loginType.value === 'password', 
      message: '请输入密码', 
      trigger: 'blur' 
    }
  ]
}))

const countDownText = computed(() => {
  return isCountDown.value ? `${countDown.value}秒后重新发送` : '发送验证码'
})

const router = useRouter()

// 修改发送验证码方法
const sendCode = async () => {
  try {
    await loginFormRef.value?.validateField('account')
    
    // 验证通过后发送验证码
    const api = accountType.value === 'phone' ? getPhoneCode : getEmailCode
    const res = await api(loginForm.account)
    
    if (res.data.code === '1') {
      isCountDown.value = true
      countDown.value = 60
      const timer = setInterval(() => {
        countDown.value--
        if (countDown.value <= 0) {
          clearInterval(timer)
          isCountDown.value = false
        }
      }, 1000)
      ElMessage.success('验证码发送成功')
    } else {
      ElMessage.error(res.data.msg || '验证码发送失败')
    }
  } catch (error) {
    return
  }
}

// 修改登录方法
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    
    const params = {
      ...(accountType.value === 'phone' ? { phoneNumber: loginForm.account } : { email: loginForm.account }),
      ...(loginType.value === 'code' ? { code: loginForm.code } : { password: loginForm.password })
    }
    
    const res = await login(params)
    
    if (res.data.code === '1') {
      // 保存token
      localStorage.setItem('token', res.data.data)
      ElMessage.success('登录成功')
      // 跳转到me页面
      router.push('/me')
    } else {
      ElMessage.error(res.data.msg || '登录失败')
    }
  } catch (error) {
    console.error('Login error:', error)
    return
  }
}

// 监听账号类型变化，清空账号输入
watch(accountType, () => {
  loginForm.account = ''
  loginFormRef.value?.clearValidate('account')
})

// 监听登录类型变化，清空表单
watch(loginType, () => {
  loginForm.code = ''
  loginForm.password = ''
  loginFormRef.value?.clearValidate()
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  color: #409EFF;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: bold;
}

.login-tabs {
  margin-top: 20px;
}

.code-input {
  display: flex;
  gap: 10px;
}

.send-code-btn {
  width: 100px;
  white-space: nowrap;
}

.login-btn {
  width: 100%;
  margin-top: 20px;
  height: 40px;
}

:deep(.el-input__wrapper) {
  background-color: #f5f7fa;
}

:deep(.el-tabs__nav) {
  width: 100%;
  display: flex;
}

:deep(.el-tabs__item) {
  flex: 1;
  text-align: center;
  padding: 0 5px !important;
  font-size: 14px;
}

.account-input {
  width: 100%;
  display: flex;
  gap: 10px;
}

.account-input .el-input {
  flex: 1;
}

.account-type-select {
  width: 100px;
}

:deep(.el-select .el-input__wrapper) {
  background-color: #f5f7fa;
  box-shadow: none !important;
  padding: 0 25px 0 8px;
}

:deep(.el-select-dropdown__item) {
  text-align: center;
}

:deep(.el-select .el-input__inner) {
  text-align: center;
}

:deep(.el-select .el-input) {
  border: none;
}

:deep(.el-select .el-input__wrapper) {
  background-color: transparent;
  box-shadow: none !important;
  padding: 0 25px 0 8px;
}

:deep(.el-input__wrapper) {
  background-color: #f5f7fa;
}

:deep(.el-input-group__append .el-select__caret) {
  color: var(--el-text-color-regular);
  right: 8px;
}

:deep(.el-select .el-select__popper.el-popper) {
  background-color: #f5f7fa;
}

:deep(.el-select-dropdown__item) {
  background-color: transparent;
}

:deep(.el-select-dropdown__item.hover) {
  background-color: var(--el-fill-color-light);
}

.el-form-item {
  :deep(.el-form-item__content) {
    display: flex;
  }
}
</style> 