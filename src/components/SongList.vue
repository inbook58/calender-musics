<template>
  <div class="container">
    <h2 class="date-caption">{{ formattedSelectedDate }}までの楽曲</h2>
    <div class="date-selector">
      <select v-model="selectedMonth">
        <option v-for="m in availableMonths" :key="m" :value="m">{{ m }}月</option>
      </select>
      <select v-model="selectedDay">
        <option v-for="d in availableDaysInMonth" :key="d" :value="d">{{ d }}日</option>
      </select>
    </div>
    <div v-if="visibleSongs.length > 0" class="song-list">
      <RouterLink
        v-for="song in visibleSongs"
        :key="song.id"
        :to="{ name: 'Song', params: { shareId: song.shareId } }"
        class="song-item"
        :class="{ 'song-item--with-image': resolveImageUrl(song.image) }"
        :style="cardBackgroundStyle(song.image)"
      >
        <div class="song-item__overlay"></div>
        <div class="song-info">
          <p class="song-date">{{ formatDate(song.id) }}</p>
          <h2 class="song-title">{{ song.title }}</h2>
        </div>
      </RouterLink>
    </div>
    <p v-else class="song-list-empty">
      {{ formattedSelectedDate }}までに表示できる楽曲はありません
    </p>
    <div class="load-more-container" v-if="hasMore">
      <button @click="loadMore" class="load-more-button">もっと見る</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { RouterLink } from 'vue-router'
import songs from '@/data/songs.json'
import TheHeader from '@/components/TheHeader.vue'

const SONG_YEAR = 2026

// 今日の日付（JST）を基準に、年初からの日数を計算
const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
const currentDayOfYear = (() => {
  // 開発モードではすべての日付を有効にする
  if (import.meta.env.DEV) {
    return 366
  }
  // 本番モードでは実際の日付に基づいて計算
  // 曲の年より前なら、何も解禁されていない
  if (now.getFullYear() < SONG_YEAR) return 0
  // 曲の年より後なら、すべて解禁済み
  if (now.getFullYear() > SONG_YEAR) return 366 // うるう年も考慮して366
  // 曲の年と同じなら、今日までの日数を計算
  const start = new Date(SONG_YEAR, 0, 1)
  return Math.floor((+now - +start) / 86400000) + 1
})()

// songs.json から「解禁済みの」日付の情報を前処理する
const availableDates = songs
  .filter((song) => song.id <= currentDayOfYear) // 未来の日付を除外
  .reduce(
    (acc, song) => {
      const date = new Date(SONG_YEAR, 0, song.id)
      const month = date.getMonth() + 1
      const day = date.getDate()
      if (!acc[month]) {
        acc[month] = new Set()
      }
      acc[month].add(day)
      return acc
    },
    {} as Record<number, Set<number>>
  )

const availableMonths = Object.keys(availableDates).map(Number).sort((a, b) => a - b)

// デフォルトで選択される日付を「解禁済みの最新日」に設定
const lastAvailableSong = songs
  .filter((song) => song.id <= currentDayOfYear)
  .sort((a, b) => b.id - a.id)[0]

const defaultDate = lastAvailableSong
  ? new Date(SONG_YEAR, 0, lastAvailableSong.id)
  : new Date(SONG_YEAR, 0, 1)

const selectedMonth = ref(defaultDate.getMonth() + 1)
const selectedDay = ref(defaultDate.getDate())

const INITIAL_DISPLAY_COUNT = 5
const LOAD_MORE_COUNT = 10

const displayCount = ref(INITIAL_DISPLAY_COUNT)

const resolveImageUrl = (src?: string) => {
  if (!src) return ''
  if (/^https?:\/\//.test(src)) return src
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`
  let normalized = src
  if (normalized.startsWith('@public/')) {
    normalized = normalized.slice('@public/'.length)
  } else if (normalized.startsWith('/')) {
    normalized = normalized.slice(1)
  }
  return base + normalized
}

const cardBackgroundStyle = (src?: string) => {
  const url = resolveImageUrl(src)
  return url
    ? {
        '--song-card-image': `url('${url}')`
      }
    : undefined
}

const availableDaysInMonth = computed(() => {
  return availableDates[selectedMonth.value]
    ? Array.from(availableDates[selectedMonth.value]).sort((a, b) => a - b)
    : []
})

// 月が変更されたときに日の妥当性をチェック
watch(selectedMonth, (newMonth) => {
  const days = availableDates[newMonth]
  if (!days || !days.has(selectedDay.value)) {
    // 新しい月で現在の日付が存在しない場合、その月の最後の日付を選択
    selectedDay.value = availableDaysInMonth.value[availableDaysInMonth.value.length - 1]
  }
})

const getDayOfYear = (month: number, day: number, year: number = SONG_YEAR) => {
  const date = new Date(year, month - 1, day)
  const start = new Date(year, 0, 1)
  return Math.floor((+date - +start) / 86400000) + 1
}

const selectedDayOfYear = computed(() => getDayOfYear(selectedMonth.value, selectedDay.value))

const formatDate = (dayOfYear: number, year: number = SONG_YEAR) => {
  const date = new Date(year, 0, dayOfYear)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]
  return `${month}月${day}日 (${dayOfWeek})`
}

const formattedSelectedDate = computed(() => formatDate(selectedDayOfYear.value))

// 表示対象の全曲リスト（ソート済み）
const allVisibleSongs = computed(() =>
  songs
    .filter((s) => {
      // 選択された日付より未来の曲は表示しない
      if (s.id > selectedDayOfYear.value) {
        return false
      }
      // 解禁されていない曲は表示しない
      if (s.id > currentDayOfYear) {
        return false
      }
      // 今日の曲は、一度再生ページで見てからリストに表示する
      if (s.id === currentDayOfYear) {
        const dateString = `${now.getFullYear()}-${(now.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`
        const viewedTodaySong = localStorage.getItem(`viewedTodaySong_${dateString}`)
        return viewedTodaySong === 'true'
      }
      return true
    })
    .sort((a, b) => b.id - a.id)
)

// 現在表示する曲のリスト
const visibleSongs = computed(() => allVisibleSongs.value.slice(0, displayCount.value))

// さらに読み込む曲があるかどうか
const hasMore = computed(() => displayCount.value < allVisibleSongs.value.length)

// 曲をさらに読み込む
const loadMore = () => {
  displayCount.value += LOAD_MORE_COUNT
}
</script>

<style scoped>

.container {
  max-width: 960px;
  margin: 40px auto;
  padding: 0px 20px;
}

.date-caption{
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 16px;
  text-align: center;
}

.date-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
  justify-content: center;
}

.date-selector select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background-color: #fff;
  font-size: 1rem;
}

.song-list {
  display: grid;
  gap: 12px;
  margin-top: 24px;
}


.song-item {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: clamp(18px, 3vw, 28px);
  border-radius: 14px;
  border: 1px solid rgba(230, 230, 230, 0.5);
  background: #f5f5f5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.song-item--with-image {
  background: #fff;
  color: #111;
}

.song-item--with-image::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--song-card-image);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  transition: transform 0.4s ease, opacity 0.3s ease;
}

.song-item__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.9));
  opacity: 1;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.song-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 45px rgba(20, 20, 20, 0.18);
}

.song-item--with-image:hover::before {
  transform: scale(1.02);
  opacity: 0.45;
}

.song-item--with-image:hover .song-item__overlay {
  opacity: 0.85;
}

.song-info {
  flex: 1;
  position: relative;
  z-index: 1;
}

.song-date {
  font-size: 0.78rem;
  margin: 0 0 6px 0;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  opacity: 0.75;
}

.song-title {
  font-size: clamp(1.1rem, 2.2vw, 1.3rem);
  font-weight: 700;
  margin: 0;
  color: inherit;
}

.description {
  font-size: 0.9rem;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 表示する行数を2行に制限 */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.load-more-container {
  text-align: center;
  margin-top: 24px;
}

.load-more-button {
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  transition: background-color 0.2s ease;
}

.load-more-button:hover {
  background-color: #f0f0f0;
}
</style>

