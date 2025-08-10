import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa' // Import VitePWA

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [
      vue(),
      vueDevTools(),
      VitePWA({ // PWA Configuration
        registerType: 'autoUpdate',
        injectRegister: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,json,vue}'],
        },
        manifest: {
          name: 'Calendar Musics',
          short_name: 'CalMusics',
          description: 'A calendar of musics',
          theme_color: '#ffffff',
          icons: [
            {
              src: 'pwa-icons/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-icons/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'pwa-icons/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    base: command === 'build' ? '/calender-musics/' : '/',
    build: {
      outDir: 'docs'
    }
  }
})
