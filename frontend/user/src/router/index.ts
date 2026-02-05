import { createRouter, createWebHistory } from 'vue-router'
import AuthLogin from '@/view/AuthLogin.vue'
import LoginScreen from '@/components/auth/LoginScreen.vue'
import LoginSuccess from '@/components/auth/LoginSuccess.vue'
import SignUpScreen from '@/components/auth/SignUpScreen.vue'
import ForgotPasswordScreen from '@/components/auth/ForgotPasswordScreen.vue'
import ResetPWScreen from '@/components/auth/ResetPWScreen.vue'
import HomeScreen from '@/view/HomeScreen.vue'
import { useAuthStore } from '@/stores/auth'
import Bookingpage from '@/view/BookingPage.vue'
import BookingDetail from '@/view/BookingDetail.vue'
import RoomDetailModal from '@/components/BookingDetail/RoomDetailModal.vue'
import TransactionPayment from '@/view/TransactionPayment.vue'
import LastPayment from '@/view/LastPayment.vue'
import ProfileDetail from '@/view/ProfileDetail.vue'

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
        path: 'login/success',
        name: 'login-success',
        component: LoginSuccess,
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
  {
    path: '/Bookingpage',
    name: 'Bookingpage',
    component: Bookingpage,
  },
  {
    path: '/BookingDetail',
    name: 'BookingDetail',
    component: BookingDetail,
  },
  {
    path: '/RoomDetailModal',
    name: 'RoomDetailModal',
    component: RoomDetailModal,
  },
  {
    path: '/TransactionPayment',
    name: 'TransactionPayment',
    component: TransactionPayment,
  },
  {
    path: '/LastPayment',
    name: 'LastPayment',
    component: LastPayment,
  },
  {
    path: '/ProfileDetail',
    name: 'ProfileDetail',
    component: ProfileDetail,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
