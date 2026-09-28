import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { defineConfig, type Plugin } from 'vite'

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? listFiles(join(dir, e.name)) : [join(dir, e.name)],
  )
}

// Emits sw.js with the full list of built files, so the whole app works
// offline after the first visit (including screens not opened yet).
function serviceWorker(): Plugin {
  return {
    name: 'brogan-service-worker',
    apply: 'build',
    generateBundle(_, bundle) {
      const publicFiles = listFiles('public').map((f) => '/' + relative('public', f).replaceAll('\\', '/'))
      const files = ['/', '/index.html', ...publicFiles, ...Object.keys(bundle).map((f) => '/' + f)]
      const unique = [...new Set(files)].filter((f) => !f.endsWith('.map'))
      const version = createHash('sha256').update(unique.join('\n')).digest('hex').slice(0, 12)
      const template = readFileSync('sw-template.js', 'utf8')
      if (!template.includes('__PRECACHE__') || !template.includes('__VERSION__')) {
        this.error('sw-template.js is missing its __PRECACHE__ / __VERSION__ placeholders')
      }
      const source = template
        .replaceAll('__PRECACHE__', JSON.stringify(unique, null, 2))
        .replaceAll('__VERSION__', version)
      this.emitFile({ type: 'asset', fileName: 'sw.js', source })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), serviceWorker()],
})
