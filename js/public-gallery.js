/**
 * Public Supabase gallery for the marketing page (vanilla).
 * Waits for #realizace (React SPA) or uses existing #dospreton-supabase-gallery.
 */
;(function () {
  const SECTION_HTML = `
    <div class="dospreton-public-gallery__inner">
      <p class="dospreton-public-gallery__eyebrow">GALERIE</p>
      <h2 class="dospreton-public-gallery__title">Nahrané <em>realizace</em></h2>
      <p class="dospreton-public-gallery__status" data-gallery-status hidden></p>
      <div class="dospreton-public-gallery__grid" data-gallery-grid></div>
    </div>
  `

  function ensureMount() {
    let mount = document.getElementById('dospreton-supabase-gallery')
    if (mount) return mount

    mount = document.createElement('section')
    mount.id = 'dospreton-supabase-gallery'
    mount.className = 'dospreton-public-gallery'
    mount.setAttribute('aria-label', 'Nahrané realizace')
    mount.innerHTML = SECTION_HTML

    const realizace = document.getElementById('realizace')
    if (realizace) {
      realizace.insertAdjacentElement('afterend', mount)
      return mount
    }

    const root = document.getElementById('root')
    if (root) {
      root.insertAdjacentElement('afterend', mount)
      return mount
    }

    document.body.appendChild(mount)
    return mount
  }

  function waitForRealizace(timeoutMs) {
    return new Promise((resolve) => {
      if (document.getElementById('realizace') || document.getElementById('dospreton-supabase-gallery')) {
        resolve()
        return
      }
      const obs = new MutationObserver(() => {
        if (document.getElementById('realizace') || document.getElementById('dospreton-supabase-gallery')) {
          obs.disconnect()
          resolve()
        }
      })
      obs.observe(document.documentElement, { childList: true, subtree: true })
      setTimeout(() => {
        obs.disconnect()
        resolve()
      }, timeoutMs)
    })
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
  }

  function escapeAttr(str) {
    return escapeHtml(str).replaceAll("'", '&#39;')
  }

  async function boot() {
    await waitForRealizace(8000)
    const mount = ensureMount()
    const api = window.DospretonGallery
    const statusEl = mount.querySelector('[data-gallery-status]')
    const gridEl = mount.querySelector('[data-gallery-grid]')
    if (!gridEl) return

    function setStatus(text, isError) {
      if (!statusEl) return
      statusEl.textContent = text || ''
      statusEl.classList.toggle('is-error', Boolean(isError))
      statusEl.hidden = !text
    }

    if (!api?.configured) {
      setStatus('Online galerie není nakonfigurována (chybí js/supabase-config.js).', true)
      return
    }

    setStatus('Načítám galerii…', false)

    let items = []
    let lightboxIndex = 0

    try {
      items = (await api.fetchGalleryImages()).filter((i) => i.url)
    } catch (err) {
      console.error('Gallery error:', err)
      setStatus('Galerii se nepodařilo načíst. Zkuste obnovit stránku.', true)
      return
    }

    if (!items.length) {
      setStatus('Zatím zde nejsou nahrané fotografie. Po nahrání v admin.html se zobrazí zde.', false)
      gridEl.replaceChildren()
      return
    }

    setStatus('', false)
    gridEl.replaceChildren()

    items.forEach((item, index) => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'dospreton-public-gallery__item'
      btn.setAttribute('aria-label', `Otevřít: ${item.alt}`)
      btn.innerHTML = `
        <img src="${item.url}" alt="${escapeAttr(item.alt)}" loading="lazy" width="800" height="600" />
        <span class="dospreton-public-gallery__caption">${escapeHtml(item.alt)}</span>
      `
      btn.addEventListener('click', () => openLightbox(index))
      gridEl.appendChild(btn)
    })

    let lb = document.querySelector('.dospreton-lightbox')
    if (!lb) {
      lb = document.createElement('div')
      lb.className = 'dospreton-lightbox'
      lb.innerHTML = `
        <button type="button" class="dospreton-lightbox__close" aria-label="Zavřít">×</button>
        <button type="button" class="dospreton-lightbox__nav dospreton-lightbox__nav--prev" aria-label="Předchozí">‹</button>
        <img alt="" />
        <button type="button" class="dospreton-lightbox__nav dospreton-lightbox__nav--next" aria-label="Další">›</button>
        <div class="dospreton-lightbox__meta"></div>
      `
      document.body.appendChild(lb)
      lb.querySelector('.dospreton-lightbox__close').addEventListener('click', closeLightbox)
      lb.querySelector('.dospreton-lightbox__nav--prev').addEventListener('click', () => step(-1))
      lb.querySelector('.dospreton-lightbox__nav--next').addEventListener('click', () => step(1))
      lb.addEventListener('click', (e) => {
        if (e.target === lb) closeLightbox()
      })
      document.addEventListener('keydown', (e) => {
        if (!lb.classList.contains('is-open')) return
        if (e.key === 'Escape') closeLightbox()
        if (e.key === 'ArrowLeft') step(-1)
        if (e.key === 'ArrowRight') step(1)
      })
    }

    function openLightbox(i) {
      lightboxIndex = i
      renderLightbox()
      lb.classList.add('is-open')
      document.body.style.overflow = 'hidden'
    }

    function closeLightbox() {
      lb.classList.remove('is-open')
      document.body.style.overflow = ''
    }

    function step(delta) {
      lightboxIndex = (lightboxIndex + delta + items.length) % items.length
      renderLightbox()
    }

    function renderLightbox() {
      const item = items[lightboxIndex]
      const img = lb.querySelector('img')
      img.src = item.url
      img.alt = item.alt
      lb.querySelector('.dospreton-lightbox__meta').textContent =
        `${item.alt} · ${lightboxIndex + 1} / ${items.length}`
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
})()
