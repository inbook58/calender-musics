<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import songs from '@/data/songs.json'

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
    const todaySong = songs.find((s) => s.id === todayId.value)
    if (todaySong) {
      router.push({ name: 'Song', params: { shareId: todaySong.shareId } })
    }
  } else {
    // If not viewed, go to the QR scanner page
    router.push({ path: '/qr-scanner' })
  }
}
</script>

<template>
  <header class="header">
    <RouterLink to="/" class="site-title" @click="closeMenu">
      <img src="/images/icon_sample.png" alt="Calendar Musics" class="site-logo" />
    </RouterLink>

    <div class="header-actions">
      <button @click="goToTodaysSong" class="today-song-button">今日の一曲</button>
      <button @click="toggleMenu" class="menu-button" aria-label="Toggle menu">
        <span class="menu-icon"></span>
      </button>
    </div>
  </header>

  <nav class="drawer-nav" :class="{ open: isMenuOpen }">
    <RouterLink to="/" @click="closeMenu">ホーム</RouterLink>
    <RouterLink to="/qr-scanner" @click="closeMenu">今日の一曲</RouterLink>
    <RouterLink to="/song-list" @click="closeMenu">昨日までの楽曲</RouterLink>
    <RouterLink to="/about" @click="closeMenu">アプリの使い方</RouterLink>
    <RouterLink to="/about" @click="closeMenu">販売促進ページ</RouterLink>
    <RouterLink to="/about" @click="closeMenu">ABOUT US</RouterLink>
  </nav>

  <div v-if="isMenuOpen" @click="closeMenu" class="overlay"></div>
</template>

<style scoped>
.header {
  background-color: transparent;
  padding: 10px 20px;
  border-bottom: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.site-title {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: #111;
  height: 48px;
  width: auto;
  background-color: rgba(255, 255, 255, 0.7);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.site-logo {
  height: 48px;
  width: auto;
  display: block;
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
  height: 48px;
  width: auto;
  color: #111;
  background-color: rgba(255, 255, 255, 0.7);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.today-song-button:hover {
  background-color: #fff;
}

.menu-button {
  background: rgba(255, 255, 255, 0.7);
  border: none;
  cursor: pointer;
  padding: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.menu-icon {
  display: block;
  width: 24px;
  height: 2px;
  background-color: #111;
  position: relative;
  transition: background-color 0.3s ease;
}

.menu-icon::before,
.menu-icon::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 2px;
  background-color: #111;
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
  right: 0;
  transform: translateX(100%);
  width: 250px;
  height: 100%;
  background-color: #fff;
  padding: 80px 20px 20px;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  z-index: 1050;
  display: flex;
  flex-direction: column;
}

.drawer-nav.open {
  transform: translateX(0);
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

.today-song-button,
.drawer-nav a {
  font-family: 'Kosugi', sans-serif;
}
</style>
