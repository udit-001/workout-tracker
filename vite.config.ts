import { defineConfig } from 'vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    base: '/',
    // root: 'src',
    plugins: [
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: "Lift",
                short_name: "Lift",
                description: "Track your workout routines, simply",
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-64x64.png',
                        sizes: '64x64',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ],
                start_url: '/',
                scope: '/',
                display: 'standalone',
                theme_color: '#2563EB',
                background_color: '#F8FAFC'
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                navigateFallback: null,
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    }
                ],
                skipWaiting: true,
                clientsClaim: true,
                cleanupOutdatedCaches: true,
                ignoreURLParametersMatching: [/^utm_/, /^fbclid$/]
            },
            devOptions: {
                enabled: true,
                type: 'module'
            }
        }),
    ],
    build: {
        rollupOptions: {
            input: {
                index: resolve(__dirname, "index.html"),
                workout: resolve(__dirname, "workout.html"),
                workouts: resolve(__dirname, "workouts.html"),
                'add-workout': resolve(__dirname, "add-workout.html")
            }
        },
        outDir: 'dist',
        emptyOutDir: true
    },
    appType: 'mpa'
})