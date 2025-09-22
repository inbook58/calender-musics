<script setup lang="ts">
import songs from '@/data/songs.json'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import TheHeader from '@/components/TheHeader.vue'

const props = defineProps<{ id: string }>()
const router = useRouter()

const idAsNumber = computed(() => {
  const n = Number(props.id)
  return Number.isFinite(n) ? n : NaN
})

const song = computed(() => songs.find((s) => s.id === idAsNumber.value))

const displayDate = computed(() => {
  const year = 2025
  const date = new Date(year, 0, idAsNumber.value) // Month is 0-indexed, so 0 is January
  const month = date.getMonth() + 1 // getMonth() returns 0-11
  const day = date.getDate()
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]
  return `${year}年${month}月${day}日 (${dayOfWeek})`
})

const currentIndex = computed(() => songs.findIndex((s) => s.id === idAsNumber.value))
const prevSong = computed(() => (currentIndex.value > 0 ? songs[currentIndex.value - 1] : null))
const nextSong = computed(() =>
  currentIndex.value < songs.length - 1 ? songs[currentIndex.value + 1] : null,
)

const todayId = computed(() => {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
  const start = new Date(now.getFullYear(), 0, 1) // January 1st of current year
  return Math.floor((+now - +start) / 86400000) + 1
})

const isNextSongDisabled = computed(() => {
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
  today.setHours(0, 0, 0, 0)

  // 1. If there is no next song, disable.
  if (!nextSong.value) {
    return true
  }

  // From here, nextSong.value is valid.
  const nextSongId = nextSong.value.id
  const nextSongDate = new Date(today.getFullYear(), 0, nextSongId)
  nextSongDate.setHours(0, 0, 0, 0)

  // 2. If the next song is today's song
  if (nextSongId === todayId.value) {
    const dateString = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
    const viewedTodaySong =
      typeof window !== 'undefined' ? localStorage.getItem(`viewedTodaySong_${dateString}`) : null
    // Disable if today's song has NOT been viewed
    return viewedTodaySong !== 'true'
  }

  // 3. If the next song is a future date (and not today), disable.
  return nextSongDate > today
})

const imageUrl = computed(() => {
  const src = song.value?.image
  if (!src) return ''
  // 1) Absolute URL
  if (/^https?:\/\//.test(src)) return src
  // 2) Respect deployment base (sub-path) and avoid `/<id>/assets/...` 404s
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : import.meta.env.BASE_URL + '/'
  const normalized = src.startsWith('/') ? src.slice(1) : src
  return base + normalized
})

const navigateTo = (id: number) => {
  router.push({ name: 'Song', params: { id } })
}

onMounted(() => {
  if (typeof window !== 'undefined' && idAsNumber.value === todayId.value) {
    // Check if running in browser and if it's today's song
    const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
    const dateString = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}` // YYYY-MM-DD
    localStorage.setItem(`viewedTodaySong_${dateString}`, 'true')
  }
})
</script>

<template>
  <TheHeader />
  <Transition name="fade" appear>
    <main v-if="song" class="container">
      <h1>{{ displayDate }}</h1>
      <img v-if="imageUrl" :src="imageUrl" alt="" @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')" />
      <p>{{ song.description }}</p>
      <div class="spotify-player" v-if="song.players?.spotify" v-html="song.players.spotify"></div>
      <div v-if="song.players?.apple" v-html="song.players.apple" class="apple-player"></div>
      <a v-if="song.players?.other" :href="song.players.other" target="_blank" rel="noopener"
        >リンク</a
      >

      <div class="navigation-buttons">
        <button :disabled="!prevSong" @click="navigateTo(prevSong.id)">前の日</button>
        <button :disabled="isNextSongDisabled" @click="navigateTo(nextSong.id)">次の日</button>
      </div>
    </main>
    <main v-else>404: ページが見つかりません</main>
  </Transition>
</template>

<style scoped>
main {
  padding: 20px;
}

.fade-enter-active {
  transition: opacity 2s ease;
}
.fade-enter-from {
  opacity: 0;
}

.container {
  max-width: 720px;
  margin: 40px auto;
  padding: 20px 36px;
}
img {
  max-width: 100%;
  display: block;
  margin: 16px 0;
}

.spotify-player {
  min-height: 152px;
  margin-bottom: 16px;
}

.apple-player {
  min-height: 152px;
  margin-bottom: 16px;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.navigation-buttons button {
  padding: 10px 20px;
  background-color: #fff;
  color: #111;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  border: 1px solid #eee;
}

.navigation-buttons button:hover {
  background-color: #eee;
}

.navigation-buttons button:disabled {
  background-color: #fff;
  color: #ccc;
  cursor: not-allowed;
}
</style>
