<template>
  <div class="message-page">
    <p>もうちょい待ってね</p>
    <RouterLink :to="{ name: 'SongList' }" class="button">曲リストに戻る</RouterLink>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<style scoped>
.message-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80vh;
  text-align: center;
}

p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 24px;
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
}

.button:hover {
  background-color: #555;
}
</style>
