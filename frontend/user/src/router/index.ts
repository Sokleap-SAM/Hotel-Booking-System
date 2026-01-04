import { createRouter, createWebHistory } from 'vue-router'
import AuthLogin from '@/view/AuthLogin.vue'
import LoginScreen from '@/components/auth/LoginScreen.vue'
import SignUpScreen from '@/components/auth/SignUpScreen.vue'
import ForgotPasswordScreen from '@/components/auth/ForgotPasswordScreen.vue'
import ResetPWScreen from '@/components/auth/ResetPWScreen.vue'
import HomeScreen from '@/view/HomeScreen.vue'

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
        component: ResetPWScreen,
      },
    ],
  },
  {
    path: '/home',
    component: HomeScreen,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
