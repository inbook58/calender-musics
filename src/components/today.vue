<template>
  <div class="container">
    <h1>Today's Songs</h1>
    <p>{{ today }}日目までの曲一覧です。</p>
    <div class="song-list">
      <RouterLink
        v-for="song in visibleSongs"
        :key="song.id"
        :to="{ name: 'Song', params: { id: song.id } }"
        class="song-item"
      >
        <img :src="song.image" :alt="song.title" class="thumbnail" />
        <div class="song-info">
          <h2 class="title">{{ song.id }}: {{ song.title }}</h2>
          <p class="description">{{ song.description }}</p>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import songs from '@/data/songs.json'

// 今日の日付（JST）を基準に、年初からの日数を計算
const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
const start = new Date(now.getFullYear(), 0, 1) // 今年の1月1日
const today = Math.floor((+now - +start) / 86400000) + 1

// 表示対象の曲を計算（IDが今日の日数以下で、IDの降順にソート）
const visibleSongs = computed(() =>
  songs.filter((s) => s.id <= today).sort((a, b) => b.id - a.id)
)
</script>

<style scoped>
.container {
  max-width: 960px;
  margin: 40px auto;
  padding: 0 16px;
}

.song-list {
  display: grid;
  gap: 24px;
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
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.song-info {
  flex: 1;
}

.title {
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
</style>
