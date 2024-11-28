import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import RatingDetail from '../views/RatingDetail.vue'
import Me from '../views/Me.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/rating/:id',
      name: 'RatingDetail',
      component: RatingDetail
    },
    {
      path: '/me',
      name: 'Me',
      component: Me
    }
  ]
})

export default router
