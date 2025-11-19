import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import electron from 'vite-plugin-electron/simple'
import type { ElectronOptions } from 'vite-plugin-electron'

type ElectronOnstartArgs = Parameters<NonNullable<ElectronOptions['onstart']>>[0]

let electronStarted = false

const electronEntries = {
  main: {
    entry: resolve(__dirname, 'electron/main.ts'),
    onstart({ startup, reload }: ElectronOnstartArgs) {
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

// Check if we're building for web (Firebase hosting) or Electron
const isWebBuild = process.env.BUILD_TARGET === 'web'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Only include Electron plugin when not building for web
    ...(isWebBuild ? [] : [
      electron({
        main: electronEntries.main,
        preload: electronEntries.preload,
        renderer: {},
      }),
    ]),
  ],
  build: {
    outDir: 'dist',
  },
})
