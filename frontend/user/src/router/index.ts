import { createRouter, createWebHistory } from 'vue-router'
import AuthLogin from '@/view/AuthLogin.vue'
import LoginScreen from '@/components/auth/LoginScreen.vue'
import SignUpScreen from '@/components/auth/SignUpScreen.vue'
import ForgotPasswordScreen from '@/components/auth/ForgotPasswordScreen.vue'
import ResetPWScreen from '@/components/auth/ResetPWScreen.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/',
    component: AuthLogin,
    children: [
      {
        path: 'login',
        component: LoginScreen,
      },
      {
        path: 'signup',
        component: SignUpScreen,
      },
      {
        path: 'ForgotPassword',
        component: ForgotPasswordScreen,
      },
      {
        path: 'ResetPWScreen',
        component:ResetPWScreen,
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
