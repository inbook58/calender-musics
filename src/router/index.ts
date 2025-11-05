import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import SongPage from '@/views/SongView.vue'
import Today from '@/views/SongListView.vue'
import QrScannerView from '@/views/QrScannerView.vue'
import DotGothic16View from '@/views/fontSamples/DotGothic16View.vue'
import BIZUDPGothicView from '@/views/fontSamples/BIZ_UDPGothic.vue'
import KosugiView from '@/views/fontSamples/KosugiView.vue'
import NotoSerifJPView from '@/views/fontSamples/NotoSerifJPView.vue'
import RampartOneView from '@/views/fontSamples/RampartOneView.vue'

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
    },
    {
      path: '/font-sample/dot-gothic-16',
      name: 'DotGothic16',
      component: DotGothic16View,
      meta: { fullWidth: true }
    },
    {
      path: '/font-sample/biz-udp-gothic',
      name: 'BIZUDPGothic',
      component: BIZUDPGothicView,
      meta: { fullWidth: true }
    },
    {
      path: '/font-sample/kosugi',
      name: 'Kosugi',
      component: KosugiView,
      meta: { fullWidth: true }
    },
    {
      path: '/font-sample/noto-serif-jp',
      name: 'NotoSerifJP',
      component: NotoSerifJPView,
      meta: { fullWidth: true }
    },
    {
      path: '/font-sample/rampart-one',
      name: 'RampartOne',
      component: RampartOneView,
      meta: { fullWidth: true }
    }
  ]
})
