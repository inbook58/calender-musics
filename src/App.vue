<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { watch, ref, provide, watchEffect } from 'vue'

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