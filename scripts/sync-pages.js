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
copy(normalizedHtml, join('docs', 'index.html'))
copy(join(dist, 'assets'), join('docs', 'assets'))
if (existsSync(join(dist, 'photos'))) copy(join(dist, 'photos'), join('docs', 'photos'))
if (existsSync(join(dist, 'favicon.svg'))) copy(join(dist, 'favicon.svg'), join('docs', 'favicon.svg'))
writeFileSync('docs/CNAME', 'dospreton-stav.cz\n')
writeFileSync(join('docs', '.nojekyll'), '')
if (existsSync(join('docs', 'index.dev.html'))) rmSync(join('docs', 'index.dev.html'))

// root publish for current Pages source (main /)
copy(normalizedHtml, 'index.html')
if (existsSync('assets')) rmSync('assets', { recursive: true, force: true })
if (existsSync('photos')) rmSync('photos', { recursive: true, force: true })
copy(join(dist, 'assets'), 'assets')
if (existsSync(join(dist, 'photos'))) copy(join(dist, 'photos'), 'photos')
if (existsSync(join(dist, 'favicon.svg'))) copy(join(dist, 'favicon.svg'), 'favicon.svg')
writeFileSync('.nojekyll', '')
writeFileSync('CNAME', 'dospreton-stav.cz\n')

// Marketing page: React Realizace owns the unified gallery (no separate «Nahrané» block).
// Strip any leftover vanilla gallery inject from older syncs if present in a template.
function stripLegacyVanillaGallery(htmlPath) {
  if (!existsSync(htmlPath)) return
  let html = readFileSync(htmlPath, 'utf8')
  const before = html
  html = html.replace(/\s*<link rel="stylesheet" href="\.\/css\/public-gallery\.css[^"]*" \/>\n?/g, '\n')
  html = html.replace(
    /\s*<!-- Vanilla Supabase gallery[\s\S]*?<script src="\.\/js\/public-gallery\.js[^"]*"><\/script>\n?/g,
    '\n',
  )
  // Also strip loose legacy script tags if comment marker missing
  html = html.replace(/\s*<script src="\.\/js\/crypto-polyfill\.js[^"]*"><\/script>\n?/g, '\n')
  html = html.replace(/\s*<script src="\.\/js\/supabase-config\.js[^"]*"><\/script>\n?/g, '\n')
  html = html.replace(
    /\s*<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@2\/dist\/umd\/supabase\.min\.js"><\/script>\n?/g,
    '\n',
  )
  html = html.replace(/\s*<script src="\.\/js\/supabase-client\.js[^"]*"><\/script>\n?/g, '\n')
  html = html.replace(/\s*<script src="\.\/js\/public-gallery\.js[^"]*"><\/script>\n?/g, '\n')
  if (html !== before) writeFileSync(htmlPath, html)
}

stripLegacyVanillaGallery('index.html')
stripLegacyVanillaGallery(join('docs', 'index.html'))

function injectAdminRedirect(htmlPath) {
  if (!existsSync(htmlPath)) return
  let html = readFileSync(htmlPath, 'utf8')
  if (html.includes('Legacy React #admin')) return
  const snippet = `    <script>
      // Legacy React #admin → vanilla admin.html
      if (/^#\\/?admin\\b/i.test(location.hash)) {
        location.replace(new URL('admin.html', location.href).href);
      }
    </script>
`
  html = html.replace('<div id="root"></div>', `<div id="root"></div>\n${snippet}`)
  writeFileSync(htmlPath, html)
}

injectAdminRedirect('index.html')
injectAdminRedirect(join('docs', 'index.html'))

// Copy static vanilla admin assets into docs/ for Pages folder option
for (const file of ['admin.html', 'VANILLA-GALLERY.md']) {
  if (existsSync(file)) copy(file, join('docs', file))
}
mkdirSync('docs/css', { recursive: true })
mkdirSync('docs/js', { recursive: true })
mkdirSync('docs/supabase', { recursive: true })
for (const file of ['css/admin.css', 'css/public-gallery.css']) {
  if (existsSync(file)) copy(file, join('docs', file))
}
for (const file of [
  'js/crypto-polyfill.js',
  'js/supabase-config.example.js',
  'js/supabase-config.js',
  'js/supabase-client.js',
  'js/public-gallery.js',
  'js/admin.js',
]) {
  if (existsSync(file)) copy(file, join('docs', file))
}
for (const file of [
  'supabase/setup.sql',
  'supabase/fix-upload.sql',
  'supabase/fix-gallery-images-rls.sql',
  'supabase/add-gallery-category.sql',
]) {
  if (existsSync(file)) copy(file, join('docs', file))
}

console.log('Synced dist → docs/ and repo root for GitHub Pages (unified Realizace gallery)')
