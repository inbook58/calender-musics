<script setup lang="ts">
import songs from '@/data/songs-waiting-room.json'
import { computed, ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import TheHeader from '@/components/TheHeader.vue'

// waiting-room.json から最初の曲を常に表示
const song = ref(songs[0]);

const isPlayerVisible = ref(false)
const isContentLoaded = ref(false)

const spotifySrc = computed(() => {
  const spotifyHtml = song.value?.players?.spotify
  if (!spotifyHtml) return ''
  const match = spotifyHtml.match(/src="([^"]+)"/)
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

const imageUrl = computed(() => {
  const src = song.value?.image
  if (!src) return ''
  if (/^https?:\/\//.test(src)) return src
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

// --- Countdown Logic ---
const router = useRouter();
const targetDate = new Date('2026-01-01T00:00:00+09:00').getTime();
const days = ref(0);
const hours = ref(0);
const minutes = ref(0);
const seconds = ref(0);
let intervalId: number;

const updateCountdown = () => {
  const now = new Date().getTime();
  const distance = targetDate - now;

  if (distance < 0) {
    days.value = 0;
    hours.value = 0;
    minutes.value = 0;
    seconds.value = 0;
    clearInterval(intervalId);
    router.push({ name: 'QrScanner' });
    return;
  }

  days.value = Math.floor(distance / (1000 * 60 * 60 * 24));
  hours.value = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  minutes.value = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  seconds.value = Math.floor((distance % (1000 * 60)) / 1000);
};

onMounted(() => {
  updateCountdown();
  intervalId = window.setInterval(updateCountdown, 1000);
});

onBeforeUnmount(() => {
  clearInterval(intervalId);
});
// --- End Countdown Logic ---

</script>

<template>
  <TheHeader />
  <Transition name="fade" appear>
    <main class="song-page">
      <div class="content">
        <header class="song-page__header">
          <h1 class="message-container">
            おっと!<br><br>
            2026まではこの曲を聴いて待っててね
            <hr class="message-divider" />
          </h1>

          <div v-if="song" class="song-details"
            :class="{ 'with-background': usesBackground }"
            :style="backgroundStyle">
            <h2 class="song-title">{{ song.title }}</h2>
            <p class="song-artist">{{ song.artist_name }}</p>
            <p class="song-album">{{ song.album_name }}</p>
          </div>
        </header>


        <div
          v-if="isPlayerVisible && spotifySrc"
          class="spotify-player"
          :class="{ 'is-content-loaded': isContentLoaded }"
        >
          <iframe
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
          <RouterLink :to="{ name: 'Home' }" class="button">トップページ</RouterLink>
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
  font-family: 'Kosugi', sans-serif;
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

.message-container {
  font-size: 1rem;
  font-weight: bold;
  color: #444;
  line-height: 1.4;
  text-align: center;
}

.countdown-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 24px;
  letter-spacing: 0.1em;
}

.countdown {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.countdown-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f9f9f9;
  padding: 10px;
  border-radius: 8px;
  min-width: 70px;
}

.countdown-number {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.countdown-label {
  font-size: 0.8rem;
  color: #666;
  margin-top: 4px;
}


.song-details {
  /* margin-top: 20px; */
  padding-bottom: 20px;
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
  font-size: clamp(1.2rem, 4vw, 1.8rem);
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
    padding: 6px 0;
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

.note {
  font-size: 0.7em;
  color: #666;
  text-align: center;
  margin-top: 10px;
}

.navigation-buttons {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.button {
  padding: 10px 20px;
  background-color: #fff;
  color: #111;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  border: 1px solid #eee;
}

.button:hover {
  background-color: #eee;
}

.message-divider {
  border: none;
  border-top: 1px solid #ccc;
  margin: 20px auto;
  width: 100%;
}
</style>

