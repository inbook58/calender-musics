import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa' // Import VitePWA

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const repoBase = '/'
  const base = process.env.VITE_BASE_URL ?? (command === 'build' ? repoBase : '/')

  return {
    plugins: [
      vue(),
      // vueDevTools(),
      VitePWA({ // PWA Configuration
        registerType: 'autoUpdate',
        injectRegister: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,json,vue}'],
        },
        manifest: {
          name: 'diadia',
          short_name: 'diadia',
          description: 'A calendar of musics',
          theme_color: '#ffffff',
          start_url: `${base}qr-scanner`,
          scope: base,
          icons: [
            {
              src: 'images/diadia_icon.jpg',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'images/diadia_icon.jpg',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'images/diadia_icon.jpg',
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
    base,
    build: {
      outDir: 'docs'
    }
  }
})
