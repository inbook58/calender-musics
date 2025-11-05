<script setup lang="ts">
import { onMounted, ref } from 'vue'
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
  <div class="font-sample">
    <div class="home-header" :class="{ 'home-header--visible': isHeaderVisible }">
      <TheHeader />
    </div>
    <main class="home" :class="{ 'home--visible': isReady }">
      <section class="hero">
        <div class="hero__overlay">
          <h1 class="hero__title">dia dia</h1>
          <p class="hero__subtitle"></p>
        </div>
      </section>
    </main>
    <div class="container">
      <h1 class="heading">破って</h1>
      <p>あなたが向き合うのは<br>今日だけです。<br>
      前も後もありません。</p><br><br>

      <h1 class="heading">見て</h1>
      <p>よく見てください。<br>
      日付やイラストは<br>毎日少しづつ変わっていきます。</p><br><br>

      <h1 class="heading">聴いて</h1>
      <p>一曲づつ並び替えました。<br>
      その曲はその日を<br>象徴するものになるかもしれません。</p><br><br>

      <p>いい日とよくない日<br>好きな曲とそうでない曲。<br><br>
      dia a dia(一日一日)は<br>あなたの一年を<br>音楽とともに楽しむカレンダー。</p><br>
    </div>
  </div>
</template>

<style scoped>
.font-sample {
  font-family: 'DotGothic16', sans-serif;
}

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
  transition: opacity 2.5s ease;
}

.home-header--visible {
  opacity: 1;
}

.hero {
  position: relative;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  min-height: 100vh;
  color: #000;
  background: #fff;
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

.container {
  max-width: 720px;
  margin: 40px auto;
  padding: 20px 40px;
  font-size: 1rem;
  line-height: 1.8;
  text-align: center;
}

.heading {
  font-size: 1.8rem;
  margin-bottom: 8px;
  font-weight: bold;
}
</style>
