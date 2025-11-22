<script setup lang="ts">
import songs from '@/data/songs.json'
import { computed, ref, watch, inject, Ref, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TheHeader from '@/components/TheHeader.vue'
import { CALENDAR_YEAR } from '@/config'

const props = defineProps<{ shareId?: string }>()
const router = useRouter()
const route = useRoute()

const overriddenDate = inject<Ref<Date | null>>('overriddenDate')

const song = ref<(typeof songs)[number] | undefined>()

const isPlayerVisible = ref(false)
const isContentLoaded = ref(false)

const now = computed(() => overriddenDate?.value || new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })))

const todayId = computed(() => {
  const targetDate = now.value

  // 現在の年がカレンダーの基準年に達していない場合、解禁されている曲はない
  if (targetDate.getFullYear() < CALENDAR_YEAR) {
    return 0
  }

  // 現在の年がカレンダーの基準年を超えている場合、すべての曲が解禁済み
  if (targetDate.getFullYear() > CALENDAR_YEAR) {
    return 366; // or a larger number to unlock all
  }

  // 現在の年がカレンダーの基準年と一致する場合のみ、通算日を計算
  const start = Date.UTC(CALENDAR_YEAR, 0, 1)
  const end = Date.UTC(CALENDAR_YEAR, targetDate.getUTCMonth(), targetDate.getUTCDate())
  return (end - start) / 86400000 + 1
})

watch(() => props.shareId, (newId) => {
  if (!newId) {
    router.push({ name: 'NotFound' });
    return;
  }

  const targetSong = songs.find((s) => s.shareId === newId)

  if (!targetSong) {
    router.push({ name: 'NotFound' });
    return;
  }

  if (targetSong.id > todayId.value) {
    if (now.value.getFullYear() < CALENDAR_YEAR) {
      router.push({ name: 'WaitingRoom' });
    } else {
      router.push({ name: 'FutureSong' });
    }
    return;
  }

  song.value = targetSong

}, { immediate: true })


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
  const year = CALENDAR_YEAR
  const date = new Date(year, 0, song.value.id) // Month is 0-indexed, so 0 is January
  const month = date.getMonth() + 1 // getMonth() returns 0-11
  const day = date.getDate()
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]
  return `${year}年${month}月${day}日 (${dayOfWeek})`
})

const displayDateEn = computed(() => {
  if (!song.value) return ''
  const year = CALENDAR_YEAR
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

const isNextSongDisabled = computed(() => {
  const today = new Date(CALENDAR_YEAR, now.value.getMonth(), now.value.getDate())
  today.setHours(0, 0, 0, 0)

  // 1. If there is no next song, disable.
  if (!nextSong.value) {
    return true
  }

  // From here, nextSong.value is valid.
  const nextSongId = nextSong.value.id
  const nextSongDate = new Date(CALENDAR_YEAR, 0, nextSongId)
  nextSongDate.setHours(0, 0, 0, 0)

  // 2. If the next song is today's song
  if (nextSongId === todayId.value) {
    const dateString = `${CALENDAR_YEAR}-${(today.getMonth() + 1)
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

const backgroundStyle = computed<Record<string, string> | undefined>(() => {
  if (!usesBackground.value || !imageUrl.value) return undefined
  return {
    '--song-art-image': `url('${imageUrl.value}')`,
  }
})

const navigateTo = (shareId: string) => {
  router.push({ name: 'Song', params: { shareId } })
}

watch(song, () => {
  if (typeof window !== 'undefined' && song.value && song.value.id === todayId.value) {
    // Check if running in browser and if it's today's song
    const today = now.value
    const dateString = `${CALENDAR_YEAR}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}` // YYYY-MM-DD
    localStorage.setItem(`viewedTodaySong_${dateString}`, 'true')
  }
}, { immediate: true })

</script>

<template>
  <TheHeader />
  <Transition name="fade" appear>
    <main
      v-if="song"
      class="song-page"
    >
      <div class="content">
        <header class="song-page__header">
          <h1>{{ displayDate }}</h1>
          <p v-if="displayDateEn" class="song-page__date-en">{{ displayDateEn }}</p>
          <div v-if="song" class="song-details"
            :class="{ 'with-background': usesBackground }"
            :style="backgroundStyle">
            <h2 class="song-title">{{ song.title }}</h2>
            <p class="song-artist">{{ song.artist_name }}</p>
            <p class="song-album">{{ song.album_name }}</p>
          </div>
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

        <p class="note">配信サービスの都合により楽曲が再生できない場合があります</p>
        <div class="navigation-buttons">
          <button :disabled="!prevSong" @click="navigateTo(prevSong.shareId)">前の日</button>
          <button :disabled="isNextSongDisabled" @click="navigateTo(nextSong.shareId)">次の日</button>
        </div>
      </div>
    </main>
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
  max-width: 720px;
  margin: 40px auto;
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
  padding-top: 0;
  padding-right: clamp(24px, 6vw, 48px);
  padding-bottom: clamp(24px, 6vw, 48px);
  padding-left: clamp(24px, 6vw, 48px);
}

.song-page__header h1 {
  position: relative;
  z-index: 1;
  margin: 0;
  color: #111;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.song-page__date-en {
  position: relative;
  z-index: 1;
  font-size: clamp(0.8rem, 1.1vw, 0.95rem);
  font-weight: 400;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(30, 30, 30, 0.82);
}

.song-details {
  margin-top: 20px;
  padding: 20px;
  text-align: center;
}

.song-details.with-background {
  position: relative;
  z-index: 1;
}

.song-details.with-background::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 180px;
  height: 280px;
  background-image: var(--song-art-image);
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  pointer-events: none;
  z-index: -1;
  opacity: 0.25;
}

.song-title {
  font-size: clamp(1.2rem, 4vw, 1.8rem); /* 最小1.2rem, 画面幅の4vw, 最大1.8rem */
  font-weight: bold;
  margin: 0;
}

.song-artist {
  font-size: 1.1rem;
  margin: 8px 0 0;
  color: #555;
}

.song-album {
  font-size: 0.9rem;
  margin: 4px 0 0;
  color: #555;
  font-style: italic;
}

@media (max-width: 760px) {
  .song-page {
    margin: 0px auto;
    padding: 24px 20px;
  }

  .song-page__header {
    padding: clamp(36px, 7vw, 88px) 0;
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

.note {
  font-size: 0.7em;
  color: #666;
  text-align: center;
  margin-top: 10px;
}
</style>

