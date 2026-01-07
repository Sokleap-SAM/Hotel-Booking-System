import { createRouter, createWebHistory } from 'vue-router'
import AuthLogin from '@/view/AuthLogin.vue'
import LoginScreen from '@/components/auth/LoginScreen.vue'
import SignUpScreen from '@/components/auth/SignUpScreen.vue'
import ForgotPasswordScreen from '@/components/auth/ForgotPasswordScreen.vue'
import ResetPWScreen from '@/components/auth/ResetPWScreen.vue'
import HomeScreen from '@/view/HomeScreen.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    component: AuthLogin,
    children: [
      {
        path: '',
        redirect: '/login',
      },
      {
        path: 'login',
        name: 'login',
        component: LoginScreen,
      },
      {
        path: 'signup',
        name: 'signup',
        component: SignUpScreen,
      },
      {
        path: 'ForgotPassword',
        name: 'ForgotPassword',
        component: ForgotPasswordScreen,
      },
      {
        path: 'reset-password/:token',
        name: 'reset-password',
        component: ResetPWScreen,
      },
    ],
  },
  {
    path: '/home',
    name: 'home',
    component: HomeScreen,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
