<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="title">QuPing</h1>
      
      <el-tabs v-model="loginType" class="login-tabs">
        <el-tab-pane label="验证码登录" name="code">
          <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef">
            <el-form-item prop="account">
              <el-input 
                v-model="loginForm.account"
                placeholder="请输入手机号/邮箱"
                :prefix-icon="User"
              />
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
              <el-input 
                v-model="loginForm.account"
                placeholder="请输入手机号/邮箱"
                :prefix-icon="User"
              />
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
import { ref, reactive, computed } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'

interface LoginForm {
  account: string
  code: string
  password: string
}

const loginType = ref('code')
const loginFormRef = ref<FormInstance>()
const countDown = ref(0)
const isCountDown = ref(false)

const loginForm = reactive<LoginForm>({
  account: '',
  code: '',
  password: ''
})

const loginRules = {
  account: [
    { required: true, message: '请输入手机号/邮箱', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const countDownText = computed(() => {
  return isCountDown.value ? `${countDown.value}秒后重新发送` : '发送验证码'
})

const sendCode = () => {
  isCountDown.value = true
  countDown.value = 60
  const timer = setInterval(() => {
    countDown.value--
    if (countDown.value <= 0) {
      clearInterval(timer)
      isCountDown.value = false
    }
  }, 1000)
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate((valid) => {
    if (valid) {
      console.log('登录表单', loginForm)
    }
  })
}
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
}
</style> 