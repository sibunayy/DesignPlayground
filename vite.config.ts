/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/sightline/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      base: '/sightline/',
      includeAssets: ['icons/*.png', 'icons/*.svg', 'photos/*.webp'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
      manifest: {
        name: 'Sightline',
        short_name: 'Sightline',
        description: 'Editorial graphic design craft & optical perception studio for iPad',
        start_url: '/sightline/',
        scope: '/sightline/',
        display: 'standalone',
        background_color: '#F7F6F2',
        theme_color: '#F7F6F2',
        orientation: 'any',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
});
