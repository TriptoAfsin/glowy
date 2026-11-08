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
        id: '/',
        name: 'Glowy · soft ring light for video calls',
        short_name: 'Glowy',
        description:
          'Turn any screen into a soft, flattering ring light for video calls. Warm tones, slow golden glows, halo and edge shapes, and a pop-out light.',
        lang: 'en',
        dir: 'ltr',
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
        // Shown in richer install dialogs (Chrome, Edge, Android).
        screenshots: [
          { src: 'screenshots/wide.png', sizes: '1280x800', type: 'image/png', form_factor: 'wide', label: 'The Clear sky glow with the instrument dock' },
          { src: 'screenshots/narrow.png', sizes: '390x844', type: 'image/png', form_factor: 'narrow', label: 'Glowy on a phone with the Golden tone' },
        ],
      },
      workbox: {
        // Only the latin font subsets are precached; other subsets load on demand.
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}', '**/*latin-*.woff2'],
        // Share and install images are for crawlers and install dialogs, not for offline use.
        globIgnores: ['og-image.png', 'screenshots/**', 'icon-256.png'],
      },
    }),
  ],
})
