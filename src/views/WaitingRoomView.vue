<script setup lang="ts">
import songs from '@/data/songs-waiting-room.json'
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import TheHeader from '@/components/TheHeader.vue'

// waiting-room.json から最初の曲を常に表示
const song = ref(songs[0]);

const isPlayerVisible = ref(true); // 常に表示

const spotifySrc = computed(() => {
  const spotifyHtml = song.value?.players?.spotify
  if (!spotifyHtml) return ''
  const match = spotifyHtml.match(/src="([^"]+)"/)
  return match ? match[1] : ''
})

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
          <div class="countdown">
            <div class="countdown-item">
              <span class="countdown-number">{{ days }}</span>
              <span class="countdown-label">日</span>
            </div>
            <div class="countdown-item">
              <span class="countdown-number">{{ hours }}</span>
              <span class="countdown-label">時間</span>
            </div>
            <div class="countdown-item">
              <span class="countdown-number">{{ minutes }}</span>
              <span class="countdown-label">分</span>
            </div>
            <div class="countdown-item">
              <span class="countdown-number">{{ seconds }}</span>
              <span class="countdown-label">秒</span>
            </div>
          </div>
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
          class="spotify-player is-content-loaded"
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
          ></iframe>
        </div>

        <div
          v-if="isPlayerVisible && song.players?.apple"
          v-html="song.players.apple"
          class="apple-player is-content-loaded"
        ></div>

        <RouterLink :to="{ name: 'Home' }" class="button">トップページ</RouterLink>

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
  margin-bottom: 24px;
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

.spotify-player,
.apple-player {
  min-height: 152px;
  margin-bottom: 16px;
}

.button {
  display: inline-block;
  padding: 10px 20px;
  font-size: 1rem;
  color: #fff;
  background-color: #333;
  border-radius: 5px;
  text-decoration: none;
  transition: background-color 0.2s ease;
  display: block;
  width: fit-content;
  margin: 0 auto;
}

.button:hover {
  background-color: #555;
}
</style>

