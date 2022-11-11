import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  resolve: {
    alias: {
      '#': resolve(__dirname, 'src')
    }
  },
  plugins: [solidPlugin()],
  build: {
    target: 'esnext'
  }
})
