import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import SongPage from '@/views/SongView.vue'
import Today from '@/views/SongListView.vue'
import QrScannerView from '@/views/QrScannerView.vue'
import HowToUseView from '@/views/HowToUseView.vue'
import ShopView from '@/views/ShopView.vue'

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
      path: '/how-to-use',
      name: 'HowToUse',
      component: HowToUseView
    },
    {
      path: '/shop',
      name: 'Shop',
      component: ShopView
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
