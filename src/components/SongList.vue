<template>
  <div class="container">
    <h2 class="date-caption">{{ formattedSelectedDate }}までの楽曲</h2>

    <div class="calendar-container">
      <div class="calendar-header">
        <button @click="prevMonth" :disabled="isPrevMonthDisabled">&lt;</button>
        <h2>{{ displayDate.getFullYear() }}年 {{ displayDate.getMonth() + 1 }}月</h2>
        <button @click="nextMonth" :disabled="isNextMonthDisabled">&gt;</button>
      </div>
      <div class="calendar-grid">
        <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
        <div
          v-for="(date, index) in calendarGrid"
          :key="index"
          class="day"
          :class="{
            'not-current-month': !date.isCurrentMonth,
            'unavailable': !date.isAvailable,
            'selected': date.isSelected,
            'empty': date.day === 0,
          }"
          @click="selectDate(date)"
        >
          {{ date.day > 0 ? date.day : '' }}
        </div>
      </div>
    </div>

    <div v-if="visibleSongs.length > 0" class="song-list">
      <RouterLink
        v-for="song in visibleSongs"
        :key="song.id"
        :to="{ name: 'Song', params: { shareId: song.shareId }, query: route.query }"
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
      まだ表示できる楽曲はありません
    </p>
    <div class="load-more-container" v-if="hasMore">
      <button @click="loadMore" class="load-more-button">もっと見る</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject, Ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import songs from '@/data/songs.json'
import { CALENDAR_YEAR } from '@/config'

const route = useRoute()

const overriddenDate = inject<Ref<Date | null>>('overriddenDate')

const now = computed(() => overriddenDate?.value || new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })))

const currentDayOfYear = computed(() => {
  const targetDate = now.value

  // 現在の年がカレンダーの基準年に達していない場合、解禁されている曲はない
  if (targetDate.getFullYear() < CALENDAR_YEAR) {
    return 0
  }

  // 現在の年がカレンダーの基準年を超えている場合、すべての曲が解禁済み
  if (targetDate.getFullYear() > CALENDAR_YEAR) {
    return 366 // or a larger number to unlock all
  }

  // 現在の年がカレンダーの基準年と一致する場合のみ、通算日を計算
  const start = Date.UTC(CALENDAR_YEAR, 0, 1)
  const end = Date.UTC(CALENDAR_YEAR, targetDate.getUTCMonth(), targetDate.getUTCDate())
  return (end - start) / 86400000 + 1
})

// songs.json から「解禁済みの」日付の情報を前処理する
const availableDates = computed(() => songs
  .filter((song) => song.id <= currentDayOfYear.value) // 未来の日付を除外
  .reduce(
    (acc, song) => {
      const date = new Date(CALENDAR_YEAR, 0, song.id)
      const month = date.getMonth() + 1
      const day = date.getDate()
      if (!acc[month]) {
        acc[month] = new Set()
      }
      acc[month].add(day)
      return acc
    },
    {} as Record<number, Set<number>>
  ))

const availableMonths = computed(() => Object.keys(availableDates.value).map(Number).sort((a, b) => a - b))

// デフォルトで選択される日付を「解禁済みの最新日」に設定
const lastAvailableSong = computed(() => songs
  .filter((song) => song.id <= currentDayOfYear.value)
  .sort((a, b) => b.id - a.id)[0]
)

const selectedMonth = ref(1)
const selectedDay = ref(1)

// --- Calendar Logic ---
const displayDate = ref(new Date(CALENDAR_YEAR, 0, 1))
const weekdays = ['日', '月', '火', '水', '木', '金', '土']

const calendarGrid = computed(() => {
  const year = displayDate.value.getFullYear()
  const month = displayDate.value.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  const startDayOfWeek = firstDayOfMonth.getDay() // 0 (Sun) - 6 (Sat)
  const totalDays = lastDayOfMonth.getDate()

  const grid: { day: number; month: number; year: number; isCurrentMonth: boolean; isAvailable: boolean; isSelected: boolean; }[] = []

  // Days from previous month
  if (!isPrevMonthDisabled.value) {
    const prevMonthDate = new Date(year, month, 0)
    const prevMonth = prevMonthDate.getMonth() + 1
    const prevMonthYear = prevMonthDate.getFullYear()
    const prevMonthLastDay = prevMonthDate.getDate()
    const availableDaysInPrevMonth = availableDates.value[prevMonth] || new Set()

    for (let i = startDayOfWeek; i > 0; i--) {
      const day = prevMonthLastDay - i + 1
      grid.push({
        day: day,
        month: prevMonth,
        year: prevMonthYear,
        isCurrentMonth: false,
        isAvailable: availableDaysInPrevMonth.has(day),
        isSelected: false,
      })
    }
  } else {
    for (let i = 0; i < startDayOfWeek; i++) {
      grid.push({ day: 0, month: 0, year: 0, isCurrentMonth: false, isAvailable: false, isSelected: false })
    }
  }

  // Days of current month
  const availableDaysInCurrentMonth = availableDates.value[month + 1] || new Set()
  for (let day = 1; day <= totalDays; day++) {
    grid.push({
      day: day,
      month: month + 1,
      year: year,
      isCurrentMonth: true,
      isAvailable: availableDaysInCurrentMonth.has(day),
      isSelected: day === selectedDay.value && month + 1 === selectedMonth.value,
    })
  }

  // Days from next month
  if (!isNextMonthDisabled.value) {
    const nextMonthDate = new Date(year, month + 1, 1)
    const nextMonth = nextMonthDate.getMonth() + 1
    const nextMonthYear = nextMonthDate.getFullYear()
    const availableDaysInNextMonth = availableDates.value[nextMonth] || new Set()
    const remainingCells = 7 - (grid.length % 7)
    if (remainingCells < 7) {
      for (let i = 1; i <= remainingCells; i++) {
        grid.push({
          day: i,
          month: nextMonth,
          year: nextMonthYear,
          isCurrentMonth: false,
          isAvailable: availableDaysInNextMonth.has(i),
          isSelected: false,
        })
      }
    }
  } else {
    const remainingCells = 7 - (grid.length % 7)
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        grid.push({ day: 0, month: 0, year: 0, isCurrentMonth: false, isAvailable: false, isSelected: false })
      }
    }
  }

  return grid
})

const isPrevMonthDisabled = computed(() => {
  return displayDate.value.getFullYear() === CALENDAR_YEAR && displayDate.value.getMonth() === 0
})

const isNextMonthDisabled = computed(() => {
  return displayDate.value.getFullYear() === CALENDAR_YEAR && displayDate.value.getMonth() === 11
})

const prevMonth = () => {
  if (isPrevMonthDisabled.value) return
  displayDate.value = new Date(displayDate.value.getFullYear(), displayDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  if (isNextMonthDisabled.value) return
  displayDate.value = new Date(displayDate.value.getFullYear(), displayDate.value.getMonth() + 1, 1)
}

const selectDate = (date: { day: number; month: number; year: number; isAvailable: boolean; }) => {
  if (!date.isAvailable) return

  selectedMonth.value = date.month
  selectedDay.value = date.day

  if (displayDate.value.getMonth() + 1 !== date.month) {
    displayDate.value = new Date(date.year, date.month - 1, 1)
  }
}

watch(lastAvailableSong, (newLastSong) => {
  const defaultDate = newLastSong
    ? new Date(CALENDAR_YEAR, 0, newLastSong.id)
    : new Date(CALENDAR_YEAR, 0, 1)
  selectedMonth.value = defaultDate.getMonth() + 1
  selectedDay.value = defaultDate.getDate()
  // Also update calendar display to the selected month
  displayDate.value = new Date(CALENDAR_YEAR, defaultDate.getMonth(), 1)
}, { immediate: true })


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
  return availableDates.value[selectedMonth.value]
    ? Array.from(availableDates.value[selectedMonth.value]).sort((a, b) => a - b)
    : []
})

// 月が変更されたときに日の妥当性をチェック
watch(selectedMonth, (newMonth) => {
  const days = availableDates.value[newMonth]
  if (!days || !days.has(selectedDay.value)) {
    // 新しい月で現在の日付が存在しない場合、その月の最後の日付を選択
    if (availableDaysInMonth.value.length > 0) {
      selectedDay.value = availableDaysInMonth.value[availableDaysInMonth.value.length - 1]
    }
  }
  // Update calendar display when selectedMonth changes
  if (displayDate.value.getMonth() !== newMonth - 1) {
    displayDate.value = new Date(CALENDAR_YEAR, newMonth - 1, 1)
  }
})

const getDayOfYear = (month: number, day: number, year: number = CALENDAR_YEAR) => {
  const date = new Date(year, month - 1, day)
  const start = new Date(year, 0, 1)
  return Math.floor((+date - +start) / 86400000) + 1
}

const selectedDayOfYear = computed(() => getDayOfYear(selectedMonth.value, selectedDay.value))

const formatDate = (dayOfYear: number, year: number = CALENDAR_YEAR) => {
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
      if (s.id > currentDayOfYear.value) {
        return false
      }
      // 今日の曲は、一度再生ページで見てからリストに表示する
      if (s.id === currentDayOfYear.value) {
        const today = now.value
        const dateString = `${CALENDAR_YEAR}-${(today.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
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
.calendar-container {
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.calendar-header h2 {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.calendar-header button {
  background: none;
  border: 1px solid #ccc;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 1rem;
}
.calendar-header button:hover:not(:disabled) {
  background-color: #f0f0f0;
}
.calendar-header button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.weekday, .day {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 36px;
  font-size: 0.9rem;
}

.weekday {
  font-weight: 600;
  color: #666;
}

.day {
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.day:not(.unavailable):hover {
  background-color: #f0f0f0;
}

.day.not-current-month {
  color: #aaa;
}

.day.empty {
  pointer-events: none;
  visibility: hidden;
}

.day.unavailable {
  color: #d9d9d9;
  pointer-events: none;
}

.day.not-current-month.unavailable {
  color: #eee;
}

.day.selected {
  background-color: #333;
  color: #fff;
  font-weight: bold;
}

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
  background-size: contain;
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

.song-list-empty {
  text-align: center;
  font-size: 1rem;
  color: #666;
  margin-top: 40px;
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

