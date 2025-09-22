<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { watch } from 'vue'

const route = useRoute()

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
</script>

<template>
  <main>
    <RouterView />
  </main>
</template>

<style scoped>
main {
  padding: 0;
}
</style>
