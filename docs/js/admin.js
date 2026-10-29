;(async function () {
  const $ = (sel, root = document) => root.querySelector(sel)
  const msgEl = $('#admin-msg')
  const loginView = $('#login-view')
  const appView = $('#app-view')
  const loginForm = $('#login-form')
  const uploadForm = $('#upload-form')
  const thumbs = $('#thumbs')
  const userLine = $('#user-line')
  const emptyEl = $('#list-empty')
  const cfgMissing = $('#config-missing')

  function message(text, tone = 'info') {
    if (!msgEl) return
    msgEl.textContent = text
    msgEl.className = `msg is-visible is-${tone}`
  }

  function clearMessage() {
    if (!msgEl) return
    msgEl.textContent = ''
    msgEl.className = 'msg'
  }

  const api = window.DospretonGallery
  if (!api?.configured) {
    loginView?.classList.add('hidden')
    appView?.classList.add('hidden')
    cfgMissing?.classList.remove('hidden')
    return
  }

  cfgMissing?.classList.add('hidden')
  const { db } = api

  async function refreshList() {
    try {
      const rows = await api.fetchGalleryImages()
      thumbs.replaceChildren()
      if (!rows.length) {
        emptyEl?.classList.remove('hidden')
        return
      }
      emptyEl?.classList.add('hidden')
      for (const row of rows) {
        const fig = document.createElement('figure')
        fig.className = 'thumb'
        fig.innerHTML = `
          <img src="${row.url}" alt="${escapeAttr(row.alt)}" loading="lazy" />
          <figcaption>
            <span>${escapeHtml(row.alt)}</span>
            <button type="button" class="btn btn-danger" data-id="${row.id}" data-path="${escapeAttr(row.storagePath)}">Smazat</button>
          </figcaption>
        `
        thumbs.appendChild(fig)
      }
    } catch (err) {
      console.error(err)
      message('Nepodařilo se načíst seznam fotografií.', 'error')
    }
  }

  async function syncSession() {
    const { data } = await db.auth.getSession()
    const session = data.session
    if (session?.user) {
      loginView.classList.add('hidden')
      appView.classList.remove('hidden')
      userLine.innerHTML = `Přihlášen: <strong>${escapeHtml(session.user.email || session.user.id)}</strong>`
      await refreshList()
    } else {
      appView.classList.add('hidden')
      loginView.classList.remove('hidden')
      thumbs.replaceChildren()
    }
  }

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault()
    clearMessage()
    const email = $('#email').value.trim()
    const password = $('#password').value
    const btn = loginForm.querySelector('button[type="submit"]')
    btn.disabled = true
    try {
      const { error } = await db.auth.signInWithPassword({ email, password })
      if (error) throw error
      message('Přihlášení úspěšné.', 'ok')
      await syncSession()
    } catch (err) {
      console.error(err)
      message(err.message || 'Přihlášení se nezdařilo.', 'error')
    } finally {
      btn.disabled = false
    }
  })

  $('#logout')?.addEventListener('click', async () => {
    await db.auth.signOut()
    message('Byli jste odhlášeni.', 'info')
    await syncSession()
  })

  $('#refresh')?.addEventListener('click', async () => {
    clearMessage()
    await refreshList()
    message('Seznam obnoven.', 'ok')
  })

  uploadForm?.addEventListener('submit', async (e) => {
    e.preventDefault()
    clearMessage()
    const { data } = await db.auth.getSession()
    const user = data.session?.user
    if (!user) {
      message('Nejste přihlášeni.', 'error')
      return
    }

    const input = $('#photos')
    const alt = $('#alt-text').value
    const check = api.validateFiles(input.files)
    if (!check.ok) {
      message(check.error, 'error')
      return
    }

    const btn = uploadForm.querySelector('button[type="submit"]')
    btn.disabled = true
    let done = 0
    try {
      for (const file of check.files) {
        message(`Nahrávám ${done + 1}/${check.files.length}: ${file.name}`, 'info')
        await api.uploadOne(file, user.id, alt)
        done += 1
      }
      message(`Hotovo — nahráno ${done} fotografií.`, 'ok')
      uploadForm.reset()
      await refreshList()
    } catch (err) {
      console.error(err)
      message(
        `Chyba nahrávání${done ? ` (po ${done} souborech)` : ''}. Zkontrolujte Storage/RLS.`,
        'error',
      )
    } finally {
      btn.disabled = false
    }
  })

  thumbs?.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-id]')
    if (!btn) return
    const id = btn.getAttribute('data-id')
    const storagePath = btn.getAttribute('data-path')
    if (!confirm('Opravdu smazat tuto fotografii?')) return
    btn.disabled = true
    try {
      await api.deleteImage({ id, storagePath })
      message('Fotografie smazána.', 'ok')
      await refreshList()
    } catch (err) {
      console.error(err)
      message('Smazání se nezdařilo (RLS / Storage policy).', 'error')
      btn.disabled = false
    }
  })

  db.auth.onAuthStateChange(() => {
    syncSession()
  })

  await syncSession()

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
})()
