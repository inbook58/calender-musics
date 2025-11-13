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
      meta: {title: 'ホーム - diadia', fullWidth: true }
    },
    {
      path: '/qr-scanner',
      name: 'QrScanner',
      component: QrScannerView,
      meta: {title: 'QRスキャナー - diadia'}
    },
    {
      path: '/how-to-use',
      name: 'HowToUse',
      component: HowToUseView,
      meta: {title: '使い方 - diadia'}
    },
    {
      path: '/shop',
      name: 'Shop',
      component: ShopView,
      meta: {title: 'SHOP - diadia'}
    },
    {
      path: '/song/:shareId',
      name: 'Song',
      component: SongPage,
      props: true,
      meta: {title: 'song - diadia'}
    },
    {
      path: '/song-list',
      name: 'SongList',
      component: Today,
      meta: {title: '昨日までの楽曲 - diadia'}
    }
  ]
})
