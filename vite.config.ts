import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import electron from 'vite-plugin-electron/simple'

let electronStarted = false

const electronEntries = {
  main: {
    entry: resolve(__dirname, 'electron/main.ts'),
    onstart({ startup, reload }) {
      if (!electronStarted) {
        electronStarted = true
        startup()
      } else {
        reload()
      }
    },
    vite: {
      build: {
        outDir: 'dist-electron/main',
        rollupOptions: {
          external: ['electron'],
        },
      },
    },
  },
  preload: {
    input: {
      main: resolve(__dirname, 'electron/preload.ts'),
    },
    vite: {
      build: {
        outDir: 'dist-electron/preload',
        rollupOptions: {
          external: ['electron'],
        },
      },
    },
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron({
      main: electronEntries.main,
      preload: electronEntries.preload,
      renderer: {},
    }),
  ],
  build: {
    outDir: 'dist',
  },
})
