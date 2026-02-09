import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import HotelLayout from '../layouts/HotelLayout.vue'
import HotelManagementView from '../views/HotelManagementView.vue'
import AddHotelView from '../views/AddHotelView.vue'
import EditHotelView from '../views/EditHotelView.vue'
import RoomManagementView from '../views/RoomManagementView.vue'
import AddRoomView from '../views/AddRoomView.vue'
import EditRoomView from '../views/EditRoomView.vue'
import AmenityManagementView from '../views/AmenityManagementView.vue'
import BookingManagementView from '../views/BookingManagementView.vue'
import AdminLoginView from '../views/AdminLoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: AdminLoginView,
    },
    {
      path: '/manage_hotel&room',
      component: HotelLayout,
      children: [
        {
          path: '',
          name: 'hotel-management',
          component: HotelManagementView,
        },
        {
          path: 'add',
          name: 'add-hotel',
          component: AddHotelView,
        },
        {
          path: 'edit/:id',
          name: 'edit-hotel',
          component: EditHotelView,
        },
        {
          path: ':id/rooms',
          name: 'room-management',
          component: RoomManagementView,
        },
        {
          path: ':id/rooms/add',
          name: 'add-room',
          component: AddRoomView,
        },
        {
          path: ':id/rooms/edit/:roomId',
          name: 'edit-room',
          component: EditRoomView,
        },
      ]
    },
    {
      path: '/amenities',
      component: HotelLayout,
      children: [
        {
          path: '',
          name: 'amenity-management',
          component: AmenityManagementView,
        },
      ]
    },
    {
      path: '/bookings',
      component: HotelLayout,
      children: [
        {
          path: '',
          name: 'booking-management',
          component: BookingManagementView,
        },
      ]
    }
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.path === '/login') {
    if (authStore.isAuthenticated) {
      next('/manage_hotel&room')
    } else {
      next()
    }
    return
  }

  if (!authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router