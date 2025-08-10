<script setup lang="ts">
import songs from '@/data/songs.json'
import { computed } from 'vue'
const props = defineProps<{ id: number }>()
const song = songs.find((s) => s.id === props.id)
const imageUrl = computed(() => {
  if (song) {
    return `${import.meta.env.BASE_URL}${song.image.startsWith('/') ? song.image.substring(1) : song.image}`
  }
  return ''
})
</script>

<template>
  <Transition name="fade" appear>
    <main v-if="song" class="container">
      <h1>{{ song.title }}</h1>
      <img :src="imageUrl" alt="" />
      <p>{{ song.description }}</p>
      <div class="spotify-player" v-if="song.players?.spotify" v-html="song.players.spotify"></div>
      <div v-if="song.players?.apple" v-html="song.players.apple"></div>
      <a v-if="song.players?.other" :href="song.players.other" target="_blank" rel="noopener">リンク</a>
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

.container {
  max-width: 720px;
  margin: 40px auto;
  padding: 0 16px;
}
img {
  max-width: 100%;
  display: block;
  margin: 16px 0;
}

.spotify-player {
  margin-bottom: 16px;
}
</style>
