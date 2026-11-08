import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Set BASE_PATH=/glowy/ when deploying under a sub-path (e.g. GitHub Pages).
const base = process.env.BASE_PATH ?? '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Glowy · soft light for video calls',
        short_name: 'Glowy',
        description:
          'Turn any screen into a soft, flattering light for video calls. Warm tones, slow golden glows, halo and edge shapes.',
        theme_color: '#0F1729',
        background_color: '#0F1729',
        display: 'standalone',
        orientation: 'any',
        start_url: base,
        scope: base,
        categories: ['productivity', 'utilities', 'photo'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Only the latin font subsets are precached; other subsets load on demand.
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}', '**/*latin-*.woff2'],
      },
    }),
  ],
})
