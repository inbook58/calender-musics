<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

// Calculate today's day of the year
const todayId = computed(() => {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
  const start = new Date(now.getFullYear(), 0, 1) // January 1st of current year
  return Math.floor((+now - +start) / 86400000) + 1
})
</script>

<template>
  <header>
    <RouterLink to="/today-list">昨日までの楽曲一覧</RouterLink>
    <!-- Home links to Today List -->

    <div class="spacer"></div>
    <!-- For pushing QR button to right -->
    <RouterLink to="/">QR Scan</RouterLink>
    <!-- QR Scan on right -->
  </header>
  <router-view />
</template>

<style>
header {
  background-color: #ffffff;
  padding: 10px 20px;
  border-bottom: 1px solid #ccc;
  display: flex; /* Use flexbox */
  align-items: center;
  justify-content: space-between; /* Distribute items */
}

header a {
  text-decoration: none;
  color: #333;
  font-weight: bold;
}

.center-link {
  flex-grow: 1; /* Allows it to take available space */
  text-align: center; /* Centers its content */
}

.spacer {
  /* No longer needed as flex-grow on center-link handles spacing */
  /* flex-grow: 1; */
  width: 0; /* Collapse spacer */
}
</style>
