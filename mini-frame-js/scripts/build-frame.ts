/**
 * 构建 global-widget.js 和 相关chunk
 * 这里用html作为入口构建，而不用build.lib，因为vite仅在html模式下才会构建动态import的chunk
 */

import path from 'path'
import fs from 'fs/promises'
import { build, InlineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import rollupNodePolyFill from 'rollup-plugin-polyfill-node'
import viteCompression from 'vite-plugin-compression'

const output = path.resolve('dist')

async function buildFrame() {
  const config: InlineConfig = {
    root: 'src',
    base: '/global-widget',
    resolve: {
      alias: {
        '@': path.resolve('src')
      }
    },
    define: {
      'process.server': false,
      'process.browser': true
    },
    build: {
      emptyOutDir: true,
      manifest: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: [
            'console.log',
            'console.info',
            'console.debug',
            'console.time',
            'console.timeEnd'
          ]
        }
      },
      modulePreload: {
        polyfill: false
      },
      outDir: output,
      assetsDir: 'assets',
      cssCodeSplit: true,
      reportCompressedSize: true,
      chunkSizeWarningLimit: 500,
      assetsInlineLimit: 10 * 1024,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // React 核心 - 最高优先级，单独打包
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')
            ) {
              return 'vendor-react'
            }
            // qrcode 单独打包（较大且不是首屏需要）
            if (id.includes('qrcode')) {
              return 'vendor-qrcode'
            }
            // axios 和请求相关
            // 注意：拆分为独立 chunk 时，可能与其他 vendor chunk 形成循环依赖（ESM TDZ），导致线上报错：
            // ReferenceError: Cannot access 't' before initialization
            // 这里将其合并回 vendor，避免跨 chunk 循环依赖。
            if (id.includes('axios') || id.includes('@unified/request') || id.includes('qs/lib')) {
              return 'vendor'
            }
            // i18next 相关
            if (id.includes('i18next')) {
              return 'vendor-i18n'
            }
            // 其他 node_modules 放到 vendor
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          }
        },
        plugins: [rollupNodePolyFill()]
      }
    },
    plugins: [
      react(),
      viteCompression({
        algorithm: 'gzip',
        threshold: 1024,
        // 只压缩指定类型的文件，避免对 mp4 等媒体文件生成 .gz
        filter: /\.(js|css|html|svg|json)$/i
      }),
      visualizer({
        filename: 'stats.html',
        gzipSize: true,
        brotliSize: true
      })
    ],
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
        generateScopedName: 'brand-[hash:base64:8]'
      }
    }
  }

  // build
  await build(config)
  // delete html
  await fs.rm(path.resolve(output, 'index.html'))
}

async function buildEntry() {
  const manifest = require(path.resolve(output, 'manifest.json')) as Record<
    string,
    {
      file?: string
      css?: string[]
    }
  >
  const indexEntry = manifest['index.html']

  if (!indexEntry?.file) {
    throw new Error('manifest.json 中缺少 index.html 的 file 字段，无法生成 global-widget.js')
  }

  const indexFile = indexEntry.file
  const cssFiles = indexEntry.css ?? []
  const content = `import './${indexFile}';
const cssFiles = ${JSON.stringify(cssFiles)};

cssFiles.forEach((cssFile) => {
  const href = '/global-widget/' + cssFile;
  const exists = document.querySelector('link[rel="stylesheet"][href="' + href + '"]');
  if (exists) {
    return;
  }
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = href;
  document.head.appendChild(style);
});
`
  await fs.writeFile(path.resolve(output, 'global-widget.js'), content)
}

async function runBuild() {
  await buildFrame()
  await buildEntry()
}

runBuild()
