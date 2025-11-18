<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { watch, ref, provide, watchEffect, computed } from 'vue'

const route = useRoute()

// Provide a ref to be updated with the overridden date
const overriddenDate = ref<Date | null>(null)
provide('overriddenDate', overriddenDate)

watchEffect(() => {
  const { date, mode } = route.query

  if (mode === 'dev' && typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    // JSTとして解釈されるように、T12:00:00を追加してタイムゾーンの曖昧さをなくす
    overriddenDate.value = new Date(`${date}T12:00:00+09:00`)
  } else {
    overriddenDate.value = null
  }
})

watch(
  () => route.meta,
  (meta) => {
    const appElement = document.getElementById('app')
    if (appElement) {
      if (meta.fullWidth) {
        appElement.classList.add('full-width')
      } else {
        appElement.classList.remove('full-width')
      }
    }
  },
  { immediate: true }
)

const isFooterVisible = computed(() => route.name !== 'QrScanner')
</script>

<template>
  <div class="app-wrapper">
    <main>
      <RouterView />
    </main>
    <footer v-if="isFooterVisible">
      <div class="footer-content">
        <a href="https://www.instagram.com/diadia_2026/" target="_blank" rel="noopener noreferrer" class="social-icon-link">
          <i class="fab fa-instagram"></i>
        </a>
        <a href="mailto:hello.diadia365@gmail.com" class="social-icon-link">
          <i class="fas fa-envelope"></i>
        </a>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  padding: 0;
  flex-grow: 1;
}

footer {
  margin-top: 0px;
  padding: 20px;
  background-color: white;
  text-align: center;
  border-top: 1px solid #eee;
  width: 100%;
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.social-icon-link {
  color: #333;
  font-size: 1.5rem;
  text-decoration: none;
  transition: color 0.2s ease;
}

.social-icon-link:hover {
  color: #555;
}
</style>
