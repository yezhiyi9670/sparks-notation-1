import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: '../static-resources/core-resources',
          dest: '.'
        }
      ]
    }),
    react()
  ],
  build: {
    sourcemap: true
  },
  worker: {
    format: 'es'  // Worker defaults to iife build https://github.com/vitejs/vite/issues/18585
  }
})
