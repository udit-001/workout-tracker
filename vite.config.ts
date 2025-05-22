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
                        src: 'icons/pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'icons/pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'icons/pwa-64x64.png',
                        sizes: '64x64',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ],
                start_url: '/',
                scope: '/',
                display: 'standalone',
                theme_color: '#2563EB',
                background_color: '#F8FAFC',
                shortcuts: [
                    {
                        name: 'Home',
                        short_name: 'Home',
                        description: 'Go to home page',
                        url: '/',
                    },
                    {
                        name: 'Add Exercise',
                        short_name: 'Add',
                        description: 'Add a new exercise',
                        url: '/add-exercise',
                    },
                    {
                        name: 'View Workouts',
                        short_name: 'Workouts',
                        url: '/workouts',
                    },
                    {
                        name: 'Manage Days',
                        short_name: 'Days',
                        description: 'Manage workout days',
                        url: '/manage-days',
                    }
                ]
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
                'add-exercise': resolve(__dirname, "add-exercise.html"),
                'manage-days': resolve(__dirname, "manage-days.html"),
                preferences: resolve(__dirname, "preferences.html")
            }
        },
        outDir: 'dist',
        emptyOutDir: true
    },
    appType: 'mpa'
})