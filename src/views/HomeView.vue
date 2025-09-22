<script setup lang="ts">
import { onMounted, ref } from 'vue'
import SongList from '@/components/SongList.vue'
import TheHeader from '@/components/TheHeader.vue'

const isReady = ref(false)
const isHeaderVisible = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    isReady.value = true
    setTimeout(() => {
      isHeaderVisible.value = true
    }, 1600)
  })
})
</script>

<template>
  <div class="home-header" :class="{ 'home-header--visible': isHeaderVisible }">
    <TheHeader />
  </div>
  <main class="home" :class="{ 'home--visible': isReady }">
    <section class="hero">
      <div class="hero__overlay">
        <h1 class="hero__title">dia dia</h1>
        <p class="hero__subtitle">クァW瀬drftgyふじこlp</p>
      </div>
    </section>

    <SongList />
  </main>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  opacity: 0;
  transition: opacity 2.5s ease;
}

.home--visible {
  opacity: 1;
}

.home-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1200;
  opacity: 0;
  transition: opacity 0.8s ease;
}

.home-header--visible {
  opacity: 1;
}

.hero {
  position: relative;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  min-height: 100vh;
  color: #fff;
  background: url('/images/firstViewSample.png') center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.hero__overlay {
  position: relative;
  z-index: 1;
  padding: clamp(32px, 6vw, 80px);
  /* background: rgba(0, 0, 0, 0.3); */
  border-radius: 16px;
}

.hero__title {
  margin: 0;
  font-size: clamp(2.4rem, 6vw, 4rem);
  font-weight: 700;
}

.hero__subtitle {
  margin-top: 12px;
  font-size: clamp(1.1rem, 3.2vw, 1.6rem);
}

@media (min-width: 768px) {
  .home {
    gap: 32px;
  }
}
</style>
