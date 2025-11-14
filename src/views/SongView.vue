<script setup lang="ts">
import songs from '@/data/songs.json'
import { computed, onBeforeUnmount, onMounted, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import TheHeader from '@/components/TheHeader.vue'

const props = defineProps<{ shareId: string }>()
const router = useRouter()

const isPlayerVisible = ref(false)
const isContentLoaded = ref(false)

const song = computed(() => songs.find((s) => s.shareId === props.shareId))

const spotifySrc = computed(() => {
  const spotifyHtml = song.value?.players?.spotify
  if (!spotifyHtml) return ''
  const match = spotifyHtml.match(/src="([^"]+)"/) // Extract src URL from iframe HTML
  return match ? match[1] : ''
})

const onContentLoad = () => {
  isContentLoaded.value = true
}

watch(
  song,
  async (newSong) => {
    isPlayerVisible.value = false
    isContentLoaded.value = false
    await nextTick()
    isPlayerVisible.value = true

    // For Apple Music, we can't easily detect iframe load from v-html.
    // We'll simulate it with a short delay.
    if (newSong?.players?.apple && !newSong?.players?.spotify) {
      setTimeout(() => {
        onContentLoad()
      }, 200) // Adjust delay as needed
    }
  },
  { immediate: true },
)

const displayDate = computed(() => {
  if (!song.value) return ''
  const year = 2026
  const date = new Date(year, 0, song.value.id) // Month is 0-indexed, so 0 is January
  const month = date.getMonth() + 1 // getMonth() returns 0-11
  const day = date.getDate()
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]
  return `${year}年${month}月${day}日 (${dayOfWeek})`
})

const displayDateEn = computed(() => {
  if (!song.value) return ''
  const year = 2026
  const date = new Date(year, 0, song.value.id)
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    weekday: 'long'
  })
  const parts = formatter.formatToParts(date)
  const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? ''
  const month = pick('month')
  const day = pick('day')
  const yearStr = pick('year')
  const weekday = pick('weekday')
  if (!month || !day || !yearStr || !weekday) return formatter.format(date)
  return `${month} ${day}, ${yearStr} (${weekday})`
})

const currentIndex = computed(() => (song.value ? songs.findIndex((s) => s.id === song.value.id) : -1))
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
  let normalized = src
  if (normalized.startsWith('@public/')) {
    normalized = normalized.slice('@public/'.length)
  } else if (normalized.startsWith('/')) {
    normalized = normalized.slice(1)
  }
  return base + normalized
})

const usesBackground = computed(() => Boolean(imageUrl.value))

const headerEl = ref<HTMLElement | null>(null)
const artAnchor = ref('50%')

const updateArtAnchor = () => {
  if (!usesBackground.value) {
    artAnchor.value = '50%'
    return
  }
  const header = headerEl.value
  if (!header) {
    artAnchor.value = '50%'
    return
  }
  const container = header.closest('.song-page') as HTMLElement | null
  if (!container) {
    artAnchor.value = '50%'
    return
  }
  const headerRect = header.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  const centerOffset = headerRect.top - containerRect.top + headerRect.height / 2 - 20
  artAnchor.value = `${centerOffset}px`
}

const handleResize = () => {
  if (typeof window === 'undefined') return
  updateArtAnchor()
}

const headerArtStyle = computed<Record<string, string> | undefined>(() => {
  if (!usesBackground.value || !imageUrl.value) return undefined
  return {
    '--song-date-art-image': `url('${imageUrl.value}')`,
    '--song-date-art-anchor': artAnchor.value,
  }
})

const navigateTo = (shareId: string) => {
  router.push({ name: 'Song', params: { shareId } })
}

watch(song, () => {
  if (typeof window !== 'undefined' && song.value && song.value.id === todayId.value) {
    // Check if running in browser and if it's today's song
    const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
    const dateString = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}` // YYYY-MM-DD
    localStorage.setItem(`viewedTodaySong_${dateString}`, 'true')
  }
}, { immediate: true })

watch([song, usesBackground], async () => {
  if (typeof window === 'undefined') return
  await nextTick()
  updateArtAnchor()
})

watch(headerEl, async () => {
  if (typeof window === 'undefined') return
  await nextTick()
  updateArtAnchor()
})

onMounted(() => {
  if (typeof window === 'undefined') return
  updateArtAnchor()
  window.addEventListener('resize', handleResize, { passive: true })
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <TheHeader />
  <Transition name="fade" appear>
    <main
      v-if="song"
      class="song-page"
      :class="{ 'song-page--with-date-art': usesBackground, 'song-page--standard': !usesBackground }"
      :style="headerArtStyle"
    >
      <div class="content">
        <header ref="headerEl" class="song-page__header">
          <h1>{{ displayDate }}</h1>
          <p v-if="displayDateEn" class="song-page__date-en">{{ displayDateEn }}</p>
        </header>
        <img
          v-if="imageUrl && !usesBackground"
          :src="imageUrl"
          alt=""
          @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
        />

        <div
          v-if="isPlayerVisible"
          class="spotify-player"
          :class="{ 'is-content-loaded': isContentLoaded }"
        >
          <iframe
            v-if="spotifySrc"
            :key="spotifySrc"
            :src="spotifySrc"
            width="100%"
            height="152"
            frameborder="0"
            allowfullscreen=""
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            @load="onContentLoad"
          ></iframe>
        </div>

        <div
          v-if="isPlayerVisible && song.players?.apple"
          v-html="song.players.apple"
          class="apple-player"
          :class="{ 'is-content-loaded': isContentLoaded }"
        ></div>

        <a v-if="song.players?.other" :href="song.players.other" target="_blank" rel="noopener"
          >リンク</a
        >

        <div class="navigation-buttons">
          <button :disabled="!prevSong" @click="navigateTo(prevSong.shareId)">前の日</button>
          <button :disabled="isNextSongDisabled" @click="navigateTo(nextSong.shareId)">次の日</button>
        </div>
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

.song-page {
  position: relative;
  padding: 24px 16px;
}

.song-page--standard {
  max-width: 720px;
  margin: 40px auto;
  padding: 20px 36px;
}

.song-page--with-date-art {
  position: relative;
  max-width: 960px;
  margin: 0 auto 60px auto;
  padding: 0 clamp(32px, 6vw, 64px);
}

.content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
}

.song-page__header {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: clamp(36px, 7vw, 88px) 0;
}

.song-page__header h1 {
  position: relative;
  z-index: 1;
  margin: 0;
  color: #111;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-shadow: 0 0 18px rgba(255, 255, 255, 0.85);
}

.song-page__date-en {
  position: relative;
  z-index: 1;
  font-size: clamp(0.8rem, 1.1vw, 0.95rem);
  font-weight: 400;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(30, 30, 30, 0.82);
  text-shadow: 0 0 12px rgba(255, 255, 255, 0.7);
}

.song-page--with-date-art::before {
  content: '';
  position: absolute;
  top: var(--song-date-art-anchor, 50%);
  left: 50%;
  transform: translate(-50%, -50%);
  width: 180px;
  height: 280px;
  background-image: var(--song-date-art-image);
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  pointer-events: none;
  z-index: 0;
  opacity: 0.55;
}

@media (max-width: 760px) {
  .song-page--with-date-art {
    margin: 0px auto;
    padding: 24px 20px;
  }

  .song-page__header {
    padding: 32px 0;
  }

  .song-page__date-en {
    font-size: 0.95rem;
  }
}

img {
  max-width: 100%;
  display: block;
  margin: 16px 0;
}

.spotify-player,
.apple-player {
  min-height: 152px;
  margin-bottom: 16px;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.spotify-player.is-content-loaded,
.apple-player.is-content-loaded {
  opacity: 1;
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

