import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// base './' so the build works from any sub-path (GitHub Pages serves /<repo>/).
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Japan Companion · יפן בכיס',
        short_name: 'יפן בכיס',
        description: 'Phrases, show-cards and a yen converter for travelers in Japan.',
        lang: 'he',
        dir: 'rtl',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        background_color: '#f6f2ea',
        theme_color: '#f6f2ea',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,json,woff2}'],
        // Places by category (data/places/*.json, ~10 MB in all) load when first opened, then stay cached.
        globIgnores: ['**/data/places/**'],
        // The offline toilet/bin/konbini map (public/data/facilities.json) is ~1.6 MB; keep it precached.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith('/data/places/index.json'),
            handler: 'NetworkFirst',
            options: { cacheName: 'places-index', networkTimeoutSeconds: 4 },
          },
          {
            urlPattern: ({ url }) => url.pathname.includes('/data/places/'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'places', expiration: { maxEntries: 120 } },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
  },
})
