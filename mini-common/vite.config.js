import { resolve, dirname } from 'path'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { createHash } from 'crypto'
import { defineConfig } from 'vite'
import { transform } from 'esbuild'

const __dirname = dirname(fileURLToPath(import.meta.url))

function separateCssPlugin(cssEntryRelPath, standaloneCssRelPaths = []) {
  return {
    name: 'separate-css',
    async generateBundle() {
      const entryPath = resolve(__dirname, cssEntryRelPath)
      const entryDir = dirname(entryPath)
      const entrySrc = readFileSync(entryPath, 'utf-8')
      const lines = entrySrc.split('\n')

      // Parse @import paths from the entry file in order
      const importPaths = lines
        .map(l => l.trim().match(/^@import\s+['"](.+)['"]/))
        .filter(Boolean)
        .map(m => m[1])

      // Pass 1: compute hashes for all imported files → build a lookup map
      // key: absolute path, value: hashed output filename
      const hashMap = new Map()
      for (const rel of importPaths) {
        const filePath = resolve(entryDir, rel)
        const content = readFileSync(filePath, 'utf-8')
        const hash = createHash('md5').update(content).digest('hex').slice(0, 8)
        const ext = rel.slice(rel.lastIndexOf('.'))
        const base = rel.slice(rel.lastIndexOf('/') + 1, rel.lastIndexOf('.'))
        hashMap.set(filePath, `${base}.${hash}${ext}`)
      }

      // Pass 2: emit each sub-file, rewriting any internal @imports to hashed names
      const importLines = []
      for (const rel of importPaths) {
        const filePath = resolve(entryDir, rel)
        const raw = readFileSync(filePath, 'utf-8')

        // Rewrite @import refs inside this file to their hashed equivalents
        const rewritten = raw.replace(/@import\s+['"](.+)['"]/g, (match, importedRel) => {
          const absImported = resolve(dirname(filePath), importedRel)
          const hashedName = hashMap.get(absImported)
          return hashedName ? `@import "./${hashedName}"` : match
        })

        const { code: minified } = await transform(rewritten, { loader: 'css', minify: true })
        const outputName = hashMap.get(filePath)

        this.emitFile({ type: 'asset', fileName: `base/css/${outputName}`, source: minified })
        importLines.push(`@import "./${outputName}";`)
      }

      // Emit index.css: hashed @imports + remaining non-import content
      const indexBody = lines.filter(l => !l.trim().startsWith('@import')).join('\n').trim()
      const { code: minifiedIndex } = await transform(indexBody, { loader: 'css', minify: true })

      this.emitFile({
        type: 'asset',
        fileName: 'base/css/index.css',
        source: importLines.join('\n') + '\n' + minifiedIndex,
      })

      for (const relPath of standaloneCssRelPaths) {
        const filePath = resolve(__dirname, relPath)
        const raw = readFileSync(filePath, 'utf-8')
        const { code: minified } = await transform(raw, { loader: 'css', minify: true })
        this.emitFile({ type: 'asset', fileName: relPath, source: minified })
      }
    },
  }
}

export default defineConfig({
  plugins: [separateCssPlugin('base/css/index.css', ['trade/custom.css'])],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'base/js/index': resolve(__dirname, 'base/js/index.js'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
      },
    },
  },
})
