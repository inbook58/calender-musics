<script setup lang="ts">
import songs from '@/data/songs.json'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const props = defineProps<{ id: number }>()
const router = useRouter()

const song = computed(() => songs.find((s) => s.id === props.id))

const displayDate = computed(() => {
  const year = 2026
  const date = new Date(year, 0, props.id) // Month is 0-indexed, so 0 is January
  const month = date.getMonth() + 1 // getMonth() returns 0-11
  const day = date.getDate()
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]
  return `${year}年${month}月${day}日 (${dayOfWeek})`
})

const currentIndex = computed(() => songs.findIndex((s) => s.id === props.id))
const prevSong = computed(() => (currentIndex.value > 0 ? songs[currentIndex.value - 1] : null))
const nextSong = computed(() =>
  currentIndex.value < songs.length - 1 ? songs[currentIndex.value + 1] : null,
)

const isNextSongDisabled = computed(() => {
  if (!nextSong.value) {
    return true // No next song, so disable
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0) // Normalize today to start of day

  // Assuming song.id corresponds to the day of the year
  const nextSongDate = new Date(today.getFullYear(), 0, nextSong.value.id)
  nextSongDate.setHours(0, 0, 0, 0) // Normalize nextSongDate to start of day

  // Disable if the next song's date is today or in the future
  return nextSongDate >= today
})

const imageUrl = computed(() => {
  if (song.value) {
    return `${import.meta.env.BASE_URL}${song.value.image.startsWith('/') ? song.value.image.substring(1) : song.value.image}`
  }
  return ''
})

const navigateTo = (id: number) => {
  router.push({ name: 'Song', params: { id } })
}

onMounted(() => {
  const today = new Date()
  const dateString = today.toISOString().slice(0, 10) // YYYY-MM-DD
  localStorage.setItem(`viewedTodaySong_${dateString}`, 'true')
})
</script>

<template>
  <Transition name="fade" appear>
    <main v-if="song" class="container">
      <h1>{{ displayDate }}</h1>
      <img :src="imageUrl" alt="" />
      <p>{{ song.description }}</p>
      <div class="spotify-player" v-if="song.players?.spotify" v-html="song.players.spotify"></div>
      <div v-if="song.players?.apple" v-html="song.players.apple"></div>
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
.fade-enter-active {
  transition: opacity 2s ease;
}
.fade-enter-from {
  opacity: 0;
}

.container {
  max-width: 720px;
  margin: 40px auto;
  padding: 0 16px;
}
img {
  max-width: 100%;
  display: block;
  margin: 16px 0;
}

.spotify-player {
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
