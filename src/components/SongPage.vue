<template>
  <Transition name="fade" appear>
    <main v-if="song" class="container">
      <h1>{{ song.title }}</h1>
      <img :src="song.image" alt="" />
      <p>{{ song.description }}</p>
      <a :href="song.link" target="_blank" rel="noopener">リンク</a>
    </main>
    <main v-else>404: ページが見つかりません</main>
  </Transition>
</template>

<script setup lang="ts">
import songs from '@/data/songs.json'
const props = defineProps<{ id: number }>()
const song = songs.find((s) => s.id === props.id)
</script>

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
</style>
