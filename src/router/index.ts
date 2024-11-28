import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Me from '../views/me.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/me',
      name: 'Me',
      component: Me,
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      redirect: '/login'
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (token) {
      next()
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

export default router
