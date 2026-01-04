import { createRouter, createWebHistory } from 'vue-router'
import HotelLayout from '../layouts/HotelLayout.vue'
import HotelManagementView from '../views/HotelManagementView.vue'
import AddHotelView from '../views/AddHotelView.vue'
import EditHotelView from '../views/EditHotelView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/manage_hotel&room',
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
        }
      ]
    }
  ],
})

export default router