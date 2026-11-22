import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Base path /dzikirku/ sesuai target hosting GitHub Pages
// https://nugrahaadha971-beep.github.io/dzikirku/
export default defineConfig({
  base: '/dzikirku/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['mascot/*.png', 'favicon.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
      manifest: {
        name: 'DzikirKu - Tasbih & Makna',
        short_name: 'DzikirKu',
        description:
          'Tasbih digital offline dengan makna dan keutamaan dzikir yang terbuka bertahap.',
        lang: 'id',
        theme_color: '#17866b',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
