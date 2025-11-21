import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import SongPage from '@/views/SongView.vue'
import Today from '@/views/SongListView.vue'
import QrScannerView from '@/views/QrScannerView.vue'
import HowToUseView from '@/views/HowToUseView.vue'
import ShopView from '@/views/ShopView.vue'
import WaitingRoomView from '@/views/WaitingRoomView.vue'
import FutureSongView from '@/views/FutureSongView.vue'

const router = createRouter({
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
    },
    {
      path: '/waiting-room',
      name: 'WaitingRoom',
      component: WaitingRoomView,
      meta: {title: 'Waiting Room - diadia'}
    },
    {
      path: '/future-song',
      name: 'FutureSong',
      component: FutureSongView,
      meta: {title: 'チョットマッテクダサイ - diadia'}
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFoundView.vue'),
      meta: {title: 'ページが見つかりません - diadia'}
    }
  ]
})

// 404.htmlからのリダイレクトを処理
const redirectPath = sessionStorage.getItem('redirect')
if (redirectPath) {
  sessionStorage.removeItem('redirect')
  router.replace(redirectPath)
}

router.beforeEach((to, from, next) => {
  // 引き継ぎたいクエリパラメータのキー
  const persistentQueries = ['mode', 'date'];

  const newQuery = { ...to.query };
  let queryChanged = false;

  persistentQueries.forEach(key => {
    // 遷移先にキーがなく、遷移元にキーがある場合
    if (to.query[key] === undefined && from.query[key] !== undefined) {
      newQuery[key] = from.query[key];
      queryChanged = true;
    }
  });

  // クエリが変更された場合は、新しいクエリでナビゲーションを再実行
  if (queryChanged) {
    next({ ...to, query: newQuery, replace: to.fullPath === from.fullPath });
  } else {
    next(); // それ以外は通常通り
  }
});

export default router
