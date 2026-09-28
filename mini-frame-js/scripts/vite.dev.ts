import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

export default defineConfig({
  root: 'dev',
  resolve: {
    alias: {
      '@': path.resolve('src')
    }
  },
  define: {
    'process.env': process.env
  },
  server: {
    host: '127.0.0.1',
    allowedHosts: [
      'dev.bitrunfinance.com',
      'dev.test.bitrunfinance.com',
      'affiliates.test.bitrunfinance.com'
    ],
    proxy: {
      '/static': {
        changeOrigin: true,
        target: 'https://www.test.bitrunfinance.com'
      },
      '/global-widget': {
        target: 'https://www.test.bitrunfinance.com',
        changeOrigin: true
      },
      '/mapi': {
        target: 'https://www.test.bitrunfinance.com',
        changeOrigin: true
      }
    },
    port: 8004,
    hmr: true
  },
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true
        })
      ]
    }
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: 'dev-[name]__[local]-[hash:base64:5]'
    }
  }
})
