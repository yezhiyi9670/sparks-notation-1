import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: resolve(__dirname, '../dist/wrapper/'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'wrapperjs': resolve(__dirname, './wrapperjs.global.ts')
      },
      output: {
        assetFileNames: "assets/[name][extname]",
        chunkFileNames: "assets/[name].js",
        entryFileNames: "assets/[name].js",
        format: 'iife'
      }
    }
  }
})
