import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import SongPage from '@/components/SongPage.vue'
import Today from '@/components/today.vue'
import QrScannerView from '@/views/QrScannerView.vue'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/', 
      name: 'QrScanner',
      component: QrScannerView
    },
    {
      path: '/home',
      name: 'Home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'About',
      component: AboutView
    },
    {
      path: '/:id(\d{1,3})',
      name: 'Song',
      component: SongPage,
      props: (r) => ({ id: Number(r.params.id) })
    },
    {
      path: '/today-list',
      name: 'TodayList',
      component: Today
    }
  ]
})
