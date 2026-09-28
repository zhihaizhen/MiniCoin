import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: 'src',
  resolve: {
    alias: {
      '@': path.resolve('src')
    }
  },
  build: {
    emptyOutDir: true,
    outDir: path.resolve('dist-connector'),
    lib: {
      name: 'RegionFrameConnector',
      entry: path.resolve('src', 'connector.ts'),
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format}.js`
    }
  },
  plugins: [react()]
})
