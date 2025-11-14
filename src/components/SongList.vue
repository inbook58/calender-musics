<template>
  <div class="container">
    <h2 class="date-caption">{{ formattedSelectedDate }}までの楽曲</h2>
    <div class="date-selector">
      <DatePicker
        v-model:value="selectedDate"
        value-type="date"
        :editable="false"
        :clearable="false"
        :disabled-date="isDateDisabled"
        :lang="datePickerLang"
        format="yyyy/MM/dd"
      />
    </div>
    <div v-if="visibleSongs.length" class="song-list">
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
    <p v-else class="song-list-empty">{{ selectedDateLabel }}までで表示できる曲はありません</p>
    <div class="load-more-container" v-if="hasMore">
      <button @click="loadMore" class="load-more-button">もっと見る</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import DatePicker from 'vue-datepicker-next'
import ja from 'vue-datepicker-next/locale/ja'
import 'vue-datepicker-next/index.css'
import songs from '@/data/songs.json'
import TheHeader from '@/components/TheHeader.vue'

const SONG_YEAR = 2026
const DAY_IN_MS = 86400000

const INITIAL_DISPLAY_COUNT = 5
const LOAD_MORE_COUNT = 10

const displayCount = ref(INITIAL_DISPLAY_COUNT)
const sortedDayIds = songs.map((song) => song.id).sort((a, b) => a - b)
const maxSongDay = sortedDayIds[sortedDayIds.length - 1] ?? 0
const availableDaySet = new Set(sortedDayIds)
const datePickerLang = ja

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

const getDayOfYear = (month: number, day: number, year: number = SONG_YEAR) => {
  const date = new Date(year, month - 1, day)
  const start = new Date(year, 0, 1)
  return Math.floor((+date - +start) / DAY_IN_MS) + 1
}

const dayOfYearToDate = (dayOfYear: number, year: number = SONG_YEAR) => new Date(year, 0, dayOfYear)

// 今日の日付（JST）を基準に、年初からの日数を計算
const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
const currentDayOfYear = (() => {
  if (now.getFullYear() < SONG_YEAR) {
    return 0
  }
  if (now.getFullYear() > SONG_YEAR) {
    return maxSongDay
  }
  const startOfSongYear = new Date(SONG_YEAR, 0, 1)
  return Math.min(Math.floor((+now - +startOfSongYear) / DAY_IN_MS) + 1, maxSongDay)
})()

const getClosestAvailableDay = (day?: number) => {
  if (day === undefined) return undefined
  for (let i = sortedDayIds.length - 1; i >= 0; i -= 1) {
    if (sortedDayIds[i] <= day) {
      return sortedDayIds[i]
    }
  }
  return undefined
}

const defaultDayOfYear = (() => {
  if (!sortedDayIds.length) {
    return 1
  }
  const target = currentDayOfYear > 1 ? currentDayOfYear - 1 : currentDayOfYear
  return getClosestAvailableDay(target > 0 ? target : undefined) ?? sortedDayIds[0]
})()

const selectedDate = ref(dayOfYearToDate(defaultDayOfYear))

const selectedDayOfYear = computed(() =>
  getDayOfYear(selectedDate.value.getMonth() + 1, selectedDate.value.getDate())
)

const isDateDisabled = (date: Date) => {
  if (date.getFullYear() !== SONG_YEAR) {
    return true
  }
  const dayOfYear = getDayOfYear(date.getMonth() + 1, date.getDate())
  if (!availableDaySet.has(dayOfYear)) {
    return true
  }
  const unlockedDay = currentDayOfYear || 1
  return dayOfYear > unlockedDay
}

const formatDate = (dayOfYear: number, year: number = SONG_YEAR) => {
  const date = new Date(year, 0, dayOfYear)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]
  return `${month}月${day}日 (${dayOfWeek})`
}

const formattedSelectedDate = computed(() => formatDate(selectedDayOfYear.value))
const selectedDateLabel = computed(() => {
  const date = selectedDate.value
  return `${date.getMonth() + 1}月${date.getDate()}日`
})

// 表示対象の全曲リスト（ソート済み）
const allVisibleSongs = computed(() =>
  songs
    .filter((s) => {
      if (s.id > currentDayOfYear) {
        return false
      }
      if (s.id === currentDayOfYear) {
        const dateString = `${now.getFullYear()}-${(now.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`
        const viewedTodaySong = localStorage.getItem(`viewedTodaySong_${dateString}`)
        return viewedTodaySong === 'true' && s.id <= selectedDayOfYear.value
      }
      return s.id <= selectedDayOfYear.value
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

.date-caption {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 12px;
  text-align: center;
}

.date-selector {
  display: flex;
  margin-bottom: 20px;
  align-items: center;
  justify-content: center;
}

.date-selector :deep(.mx-datepicker) {
  width: 100%;
  max-width: 260px;
}

.date-selector :deep(.mx-input) {
  width: 100%;
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

.song-list-empty {
  margin-top: 24px;
  padding: 16px;
  border-radius: 10px;
  border: 1px dashed #d0d0d0;
  text-align: center;
  color: #555;
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
