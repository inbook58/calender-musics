<template>
  <div class="container">
    <h2>{{ formattedYesterdayDate }}までの楽曲</h2>
    <div class="song-list">
      <RouterLink
        v-for="song in visibleSongs"
        :key="song.id"
        :to="{ name: 'Song', params: { shareId: song.shareId } }"
        class="song-item"
      >
        <img :src="song.image" :alt="song.title" class="thumbnail" />
        <div class="song-info">
          <p class="song-date">{{ formatDate(song.id) }}</p>
          <h2 class="song-title">{{ song.title }}</h2>
        </div>
      </RouterLink>
    </div>
    <div class="load-more-container" v-if="hasMore">
      <button @click="loadMore" class="load-more-button">もっと見る</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import songs from '@/data/songs.json'
import TheHeader from '@/components/TheHeader.vue'

const INITIAL_DISPLAY_COUNT = 5
const LOAD_MORE_COUNT = 10

const displayCount = ref(INITIAL_DISPLAY_COUNT)

// 今日の日付（JST）を基準に、年初からの日数を計算
const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
const start = new Date(now.getFullYear(), 0, 1) // 今年の1月1日
const currentDayOfYear = Math.floor((+now - +start) / 86400000) + 1 // 1-indexed day of year
const yesterdayId = currentDayOfYear > 1 ? currentDayOfYear - 1 : 0; // Day of year for yesterday, 0 if it's Jan 1st

const formatDate = (dayOfYear: number, year: number = 2025) => {
  const date = new Date(year, 0, dayOfYear);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
  return `${month}月${day}日 (${dayOfWeek})`;
};

const formattedYesterdayDate = computed(() => formatDate(yesterdayId));

// 表示対象の全曲リスト（ソート済み）
const allVisibleSongs = computed(() =>
  songs.filter((s) => s.id <= yesterdayId).sort((a, b) => b.id - a.id)
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

.song-list {
  display: grid;
  gap: 12px;
  margin-top: 24px;
}

.song-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  background-color: #f9f9f9;
  text-decoration: none;
  color: inherit;
  transition: background-color 0.2s ease;
}

.song-item:hover {
  background-color: #f0f0f0;
}

.thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.song-info {
  flex: 1;
}

.song-date {
  font-size: 0.8rem;
  color: #666;
  margin: 0 0 4px 0;
}

.song-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 0 8px 0;
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
