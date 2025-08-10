<template>
  <div class="qr-scanner-container">
    <h1>QR Code Scanner</h1>
    <p v-if="!hasCamera">No camera found or access denied.</p>
    <p v-else-if="!scanning">Starting camera...</p>
    <p v-else-if="result">Scanned: {{ result }}</p>
    <p v-else>Point your camera at a QR code.</p>

    <video ref="video" autoplay playsinline></video>
    <canvas ref="canvas" style="display: none;"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import jsQR from 'jsqr';
import { useRouter } from 'vue-router';

const video = ref<HTMLVideoElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const result = ref<string | null>(null);
const scanning = ref(false);
const hasCamera = ref(true);
const router = useRouter();

let animationFrameId: number;

const tick = () => {
  if (video.value && video.value.readyState === video.value.HAVE_ENOUGH_DATA) {
    scanning.value = true;
    const context = canvas.value?.getContext('2d');
    if (context && canvas.value) {
      canvas.value.height = video.value.videoHeight;
      canvas.value.width = video.value.videoWidth;
      context.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height);
      const imageData = context.getImageData(0, 0, canvas.value.width, canvas.value.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code) {
        result.value = code.data;
        console.log('QR Code Scanned:', code.data);
        // Navigate to the scanned URL
        if (code.data.startsWith('http://') || code.data.startsWith('https://')) {
          window.location.href = code.data;
        } else {
          // Handle non-URL QR codes, e.g., display the text
          alert('Scanned text: ' + code.data);
        }
        cancelAnimationFrame(animationFrameId);
        return; // Stop scanning after first successful scan
      }
    }
  }
  animationFrameId = requestAnimationFrame(tick);
};

onMounted(async () => {
  const today = new Date();
  const dateString = today.toISOString().slice(0, 10); // YYYY-MM-DD
  const viewedTodaySong = localStorage.getItem(`viewedTodaySong_${dateString}`);

  if (viewedTodaySong === 'true') {
    // Calculate today's day of the year
    const start = new Date(today.getFullYear(), 0, 1); // January 1st of current year
    const todayId = Math.floor((+today - +start) / 86400000) + 1;
    router.replace({ name: 'Song', params: { id: todayId } });
    return; // Stop further execution of this component
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    if (video.value) {
      video.value.srcObject = stream;
      video.value.play();
      animationFrameId = requestAnimationFrame(tick);
    }
  } catch (err) {
    console.error('Error accessing camera:', err);
    hasCamera.value = false;
    scanning.value = false;
  }
});

onUnmounted(() => {
  if (video.value && video.value.srcObject) {
    (video.value.srcObject as MediaStream).getTracks().forEach(track => track.stop());
  }
  cancelAnimationFrame(animationFrameId);
});
</script>

<style scoped>
.qr-scanner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

video {
  width: 100%;
  max-width: 500px;
  border: 1px solid #ccc;
  background-color: black;
}
</style>