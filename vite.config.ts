import { defineConfig } from 'vite'
import { dirname, resolve} from 'node:path'
import { fileURLToPath} from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    base: '/',
    // root: 'src',
    plugins: [
        tailwindcss(),
        VitePWA({ registerType: 'autoUpdate', 
            devOptions: {
                enabled: false
            }
        }),
    ],
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "src/pages/index.html"),
                workout: resolve(__dirname, "src/pages/workout.html"),
                workouts: resolve(__dirname, "src/pages/workouts.html"),
                'add-workout': resolve(__dirname, "src/pages/add-workout.html")
            }
        }
    },
    appType: 'mpa'
})