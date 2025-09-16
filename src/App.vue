<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'

const isMenuOpen = ref(false)
const router = useRouter()

const todayId = computed(() => {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
  const start = new Date(now.getFullYear(), 0, 1)
  return Math.floor((+now - +start) / 86400000) + 1
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const goToTodaysSong = () => {
  closeMenu()
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
  const dateString = `${today.getFullYear()}-${(today.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
  const viewedTodaySong = localStorage.getItem(`viewedTodaySong_${dateString}`)

  if (viewedTodaySong === 'true') {
    // If already viewed, go directly to the song page
    router.push({ name: 'Song', params: { id: todayId.value } })
  } else {
    // If not viewed, go to the QR scanner page (root)
    router.push({ path: '/' })
  }
}
</script>

<template>
  <header class="header">
    <RouterLink to="/home" class="site-title" @click="closeMenu">Calendar Musics</RouterLink>

    <div class="header-actions">
      <button @click="goToTodaysSong" class="today-song-button">今日の一曲</button>
      <button @click="toggleMenu" class="menu-button" aria-label="Toggle menu">
        <span class="menu-icon"></span>
      </button>
    </div>
  </header>

  <nav class="drawer-nav" :class="{ open: isMenuOpen }">
    <RouterLink to="/home" @click="closeMenu">ホーム</RouterLink>
    <RouterLink to="/" @click="closeMenu">今日の一曲</RouterLink>
    <RouterLink to="/today-list" @click="closeMenu">昨日までの楽曲</RouterLink>
    <RouterLink to="/about" @click="closeMenu">アプリの使い方</RouterLink>
    <RouterLink to="/about" @click="closeMenu">販売促進ページ</RouterLink>
    <RouterLink to="/about" @click="closeMenu">ABOUT US</RouterLink>
  </nav>

  <div v-if="isMenuOpen" @click="closeMenu" class="overlay"></div>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
.header {
  background-color: #ffffff;
  padding: 10px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.site-title {
  font-size: 1.2rem;
  font-weight: bold;
  text-decoration: none;
  color: #333;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.today-song-button {
  padding: 8px 12px;
  font-size: 0.9rem;
  font-weight: bold;
  color: #fff;
  background-color: #333;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.today-song-button:hover {
  background-color: #555;
}

.menu-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  z-index: 1100;
}

.menu-icon {
  display: block;
  width: 24px;
  height: 2px;
  background-color: #333;
  position: relative;
  transition: background-color 0.3s ease;
}

.menu-icon::before,
.menu-icon::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 2px;
  background-color: #333;
  left: 0;
  transition: transform 0.3s ease;
}

.menu-icon::before {
  transform: translateY(-8px);
}

.menu-icon::after {
  transform: translateY(8px);
}

.drawer-nav.open + .menu-button .menu-icon,
.open .menu-icon {
 background-color: transparent;
}

.drawer-nav.open + .menu-button .menu-icon::before,
.open .menu-icon::before {
 transform: rotate(45deg);
}

.drawer-nav.open + .menu-button .menu-icon::after,
.open .menu-icon::after {
 transform: rotate(-45deg);
}

.drawer-nav {
  position: fixed;
  top: 0;
  right: -280px; /* Start off-screen */
  width: 250px;
  height: 100%;
  background-color: #fff;
  padding: 80px 20px 20px;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease;
  z-index: 1050;
  display: flex;
  flex-direction: column;
}

.drawer-nav.open {
  right: 0;
}

.drawer-nav a {
  padding: 15px 0;
  text-decoration: none;
  color: #333;
  font-size: 1.1rem;
  border-bottom: 1px solid #f0f0f0;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

main {
  padding: 20px;
}
</style>
