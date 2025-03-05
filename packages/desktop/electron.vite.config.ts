import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import { viteStaticCopy } from "vite-plugin-static-copy"
import { externalizeDepsPlugin } from 'electron-vite'

// electron.vite.config.ts
export default {
  main: defineConfig({
    plugins: [externalizeDepsPlugin()],
    worker: {
      format: 'es'  // Worker defaults to iife build https://github.com/vitejs/vite/issues/18585
    },
    build: {
      sourcemap: true,
      outDir: 'dist/main'
    }
  }),
  preload: defineConfig({
    plugins: [externalizeDepsPlugin()],
    worker: {
      format: 'es'  // Worker defaults to iife build https://github.com/vitejs/vite/issues/18585
    },
    build: {
      sourcemap: true,
      outDir: 'dist/preload'
    }
  }),
  renderer: defineConfig({
    plugins: [
      react(),
      viteStaticCopy({
        targets: [
          {
            src: '../../../static-resources/core-resources',
            dest: '.'
          }
        ]
      })
    ],
    worker: {
      format: 'es'  // Worker defaults to iife build https://github.com/vitejs/vite/issues/18585
    },
    build: {
      sourcemap: true,
      outDir: 'dist/renderer'
    }
  })
}
