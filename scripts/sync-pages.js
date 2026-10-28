import {
  cpSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  existsSync,
  renameSync,
  readFileSync,
  readdirSync,
} from 'node:fs'
import { join } from 'node:path'

const dist = 'dist'

function copy(from, to) {
  cpSync(from, to, { recursive: true })
}

// Normalize Vite output when entry is index.dev.html
const builtHtml = join(dist, 'index.dev.html')
const normalizedHtml = join(dist, 'index.html')
if (existsSync(builtHtml)) {
  let html = readFileSync(builtHtml, 'utf8')
  html = html.replaceAll('index.dev-', 'index-')
  writeFileSync(normalizedHtml, html)
  const assetsDir = join(dist, 'assets')
  if (existsSync(assetsDir)) {
    for (const name of readdirSync(assetsDir)) {
      if (name.includes('index.dev-')) {
        renameSync(join(assetsDir, name), join(assetsDir, name.replace('index.dev-', 'index-')))
      }
    }
  }
}

if (!existsSync(normalizedHtml)) {
  throw new Error('dist/index.html missing after build')
}

// docs/ for /docs Pages folder option
rmSync('docs', { recursive: true, force: true })
mkdirSync('docs', { recursive: true })
copy(join(dist, '.'), 'docs')
writeFileSync('docs/CNAME', 'dospreton-stav.cz\n')
writeFileSync(join('docs', '.nojekyll'), '')

// root publish for current Pages source (main /)
copy(normalizedHtml, 'index.html')
if (existsSync('assets')) rmSync('assets', { recursive: true, force: true })
if (existsSync('photos')) rmSync('photos', { recursive: true, force: true })
copy(join(dist, 'assets'), 'assets')
if (existsSync(join(dist, 'photos'))) copy(join(dist, 'photos'), 'photos')
if (existsSync(join(dist, 'favicon.svg'))) copy(join(dist, 'favicon.svg'), 'favicon.svg')
writeFileSync('.nojekyll', '')
writeFileSync('CNAME', 'dospreton-stav.cz\n')

console.log('Synced dist → docs/ and repo root for GitHub Pages')
