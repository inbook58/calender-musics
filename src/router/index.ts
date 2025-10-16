import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import SongPage from '@/views/SongView.vue'
import Today from '@/views/SongListView.vue'
import QrScannerView from '@/views/QrScannerView.vue'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView,
      meta: { fullWidth: true }
    },
    {
      path: '/qr-scanner',
      name: 'QrScanner',
      component: QrScannerView
    },
    {
      path: '/about',
      name: 'About',
      component: AboutView
    },
    {
      path: '/song/:shareId',
      name: 'Song',
      component: SongPage,
      props: true
    },
    {
      path: '/song-list',
      name: 'SongList',
      component: Today
    }
  ]
})
