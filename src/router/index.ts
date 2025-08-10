import { createRouter, createWebHistory } from 'vue-router'
import SongPage from '@/components/SongPage.vue'
import Today from '@/components/Today.vue'
import QrScannerView from '@/views/QrScannerView.vue' // New import

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:id(\\d{1,3})',
      name: 'Song',
      component: SongPage,
      props: (r) => ({ id: Number(r.params.id) }),
    },
    { path: '/', name: 'Today', component: Today },
    { path: '/qr-scan', name: 'QrScanner', component: QrScannerView }, // New route
  ],
})
