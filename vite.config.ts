import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'RootFacts - AI Plant/Root Recognition',
        short_name: 'RootFacts',
        description: 'Aplikasi AI untuk mengenali sayuran lewat kamera dan menghasilkan fakta menarik secara offline.',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'portrait',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        // Precache seluruh aset inti (HTML/CSS/JS) sekaligus berkas model TensorFlow.js
        // (model.json & weights.bin) agar deteksi tetap berjalan tanpa koneksi internet.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,bin}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        runtimeCaching: [
          {
            // Model generatif (Transformers.js) diunduh dari CDN Hugging Face saat pertama
            // kali dipakai; cache-first membuatnya tetap tersedia pada kunjungan berikutnya
            // meski offline/mode pesawat.
            urlPattern: ({ url }: { url: URL }) => /(^|\.)huggingface\.co$|hf\.co$|hf\.space$/.test(url.hostname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'huggingface-models',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 3001,
    host: true
  }
});
