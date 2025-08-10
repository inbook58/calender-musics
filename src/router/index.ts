import { createRouter, createWebHistory } from 'vue-router'
import SongPage from '@/components/SongPage.vue'
import Today from '@/components/Today.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/:id(\\d{1,3})',
      name: 'Song',
      component: SongPage,
      props: (r) => ({ id: Number(r.params.id) }),
    },
    { path: '/', name: 'Today', component: Today },
  ],
})
