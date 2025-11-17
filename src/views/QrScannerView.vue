<template>
  <TheHeader />
  <div class="qr-scanner-container">
    <p v-if="!hasCamera">No camera found or access denied.</p>
    <p v-else-if="!scanning">Starting camera...</p>
    <p v-else-if="result">Scanned: {{ result }}</p>
    <p v-else>
      QRコードを読み取ってください<br />
    </p>

    <div class="video-wrapper">
      <video ref="video" autoplay playsinline></video>
      <div class="qr-frame"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library'
import { useRouter, useRoute } from 'vue-router'
import TheHeader from '@/components/TheHeader.vue'
import songs from '@/data/songs.json'

const video = ref<HTMLVideoElement | null>(null)
const result = ref<string | null>(null)
const scanning = ref(false)
const hasCamera = ref(true)
const router = useRouter()
const route = useRoute()

const codeReader = new BrowserMultiFormatReader()

const stopCamera = () => {
  codeReader.reset()
  scanning.value = false
}

const startCamera = async () => {
  scanning.value = true
  try {
    if (video.value) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      video.value.srcObject = stream
      codeReader.decodeFromStream(stream, video.value, (decodeResult, err) => {
        if (decodeResult) {
          const scannedText = decodeResult.getText()
          result.value = scannedText
          console.log('Scanned:', scannedText)
          stopCamera()

          if (scannedText.startsWith('http://') || scannedText.startsWith('https://')) {
            window.location.href = scannedText
          } else {
            router.push({ name: 'Song', params: { shareId: scannedText } })
          }
        }
        if (err && !(err instanceof NotFoundException)) {
          console.error('Error decoding QR code:', err)
        }
      })
    }
  } catch (err) {
    console.error('Error accessing camera:', err)
    hasCamera.value = false
    scanning.value = false
  }
}

const handleVisibilityChange = () => {
  if (document.hidden) {
    stopCamera()
  } else {
    startCamera()
  }
}

onMounted(async () => {
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
  const dateString = `${today.getFullYear()}-${(
    today.getMonth() + 1
  ).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}` // YYYY-MM-DD
  const viewedTodaySong = localStorage.getItem(`viewedTodaySong_${dateString}`)

  if (viewedTodaySong === 'true') {
    const start = new Date(today.getFullYear(), 0, 1)
    const todayId = Math.floor((+today - +start) / 86400000) + 1
    const todaySong = songs.find((s) => s.id === todayId)
    if (todaySong) {
      router.replace({ name: 'Song', params: { shareId: todaySong.shareId } })
    }
    return
  }

  await startCamera()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  stopCamera()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped>
.qr-scanner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.video-wrapper {
  position: relative;
  width: 100%;
  max-width: 500px;
}

video {
  width: 100%;
  max-width: 500px;
  border: 1px solid #ccc;
  background-color: black;
}

.qr-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px; /* Adjust size as needed */
  height: 200px; /* Adjust size as needed */
  border: 3px solid rgba(255, 255, 255, 0.5); /* Border, adjust color as needed */
  box-sizing: border-box; /* Include padding and border in the element's total width and height */
  pointer-events: none; /* Allow interaction with elements behind the frame */
  z-index: 10; /* Ensure it's above the video */
}
</style>