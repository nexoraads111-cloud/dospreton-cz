import { useCallback, useEffect, useState } from 'react'
import { db, isSupabaseConfigured } from '../lib/supabase'
import {
  fetchRemoteGallery,
  uploadGalleryFiles,
  validateUploadFiles,
  UPLOAD_LIMITS,
} from '../lib/gallery-api'
import Logo from './Logo'

export default function AdminPage() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgTone, setMsgTone] = useState('info')
  const [remote, setRemote] = useState([])
  const [altText, setAltText] = useState('')

  const message = useCallback((text, tone = 'info') => {
    setMsg(text)
    setMsgTone(tone)
  }, [])

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) return
    try {
      const rows = await fetchRemoteGallery()
      setRemote(rows)
    } catch (err) {
      console.error(err)
      message('Nepodařilo se načíst nahrané fotografie.', 'error')
    }
  }, [message])

  const syncSession = useCallback(async () => {
    if (!db) return
    const { data } = await db.auth.getSession()
    setSession(data.session ?? null)
  }, [])

  useEffect(() => {
    if (!db) return undefined
    syncSession()
    refresh()
    const { data: sub } = db.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      if (next) refresh()
      else setRemote([])
    })
    return () => sub.subscription.unsubscribe()
  }, [syncSession, refresh])

  const onLogin = async (e) => {
    e.preventDefault()
    if (!db) return
    setBusy(true)
    message('')
    try {
      const { error } = await db.auth.signInWithPassword({ email, password })
      if (error) throw error
      message('Přihlášení úspěšné.', 'ok')
      await refresh()
    } catch (err) {
      console.error(err)
      message(err.message || 'Přihlášení se nezdařilo.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const onLogout = async () => {
    if (!db) return
    await db.auth.signOut()
    setRemote([])
    message('Byli jste odhlášeni.', 'info')
    await syncSession()
  }

  const onUpload = async (e) => {
    e.preventDefault()
    if (!session?.user) return
    const form = e.currentTarget
    const input = form.querySelector('input[type="file"]')
    const check = validateUploadFiles(input?.files)
    if (!check.ok) {
      message(check.error, 'error')
      return
    }

    setBusy(true)
    message('Nahrávám…', 'info')
    try {
      await uploadGalleryFiles(check.files, session.user, altText)
      message('Fotografie úspěšně přidány.', 'ok')
      form.reset()
      setAltText('')
      await refresh()
    } catch (err) {
      console.error(err)
      message('Chyba nahrávání. Zkontrolujte nastavení Supabase (bucket, RLS, tabulka).', 'error')
    } finally {
      setBusy(false)
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="admin">
        <header className="admin__top">
          <Logo />
          <a href="#/" className="btn btn--outline btn--sm">
            ← Zpět na web
          </a>
        </header>
        <main className="admin__panel">
          <h1>Administrace galerie</h1>
          <p className="admin__lead">
            Supabase zatím není nakonfigurován. Nastavte v prostředí (nebo <code>.env</code>)
            proměnné <code>VITE_SUPABASE_URL</code> a <code>VITE_SUPABASE_ANON_KEY</code>,
            vytvořte bucket <code>gallery</code> a tabulku <code>gallery_images</code>, poté
            znovu sestavte a nasaďte web.
          </p>
          <p>
            Podrobnosti: <code>docs/supabase-setup.md</code> v repozitáři.
          </p>
        </main>
      </div>
    )
  }

  return (
    <div className="admin">
      <header className="admin__top">
        <Logo />
        <div className="admin__top-actions">
          <a href="#/" className="btn btn--outline btn--sm">
            ← Web
          </a>
          {session && (
            <button type="button" id="logout" className="btn btn--primary btn--sm" onClick={onLogout}>
              Odhlásit
            </button>
          )}
        </div>
      </header>

      <main className="admin__panel">
        <h1>Administrace galerie</h1>
        <p className="admin__lead">
          Nahrávejte fotografie realizací (JPEG / PNG / WebP, max {UPLOAD_LIMITS.maxFiles} souborů,
          každý ≤ 5&nbsp;MB). Zobrazí se ve veřejné sekci Realizace.
        </p>

        {msg && (
          <p className={`admin__msg admin__msg--${msgTone}`} role="status">
            {msg}
          </p>
        )}

        {!session ? (
          <form className="admin__form" onSubmit={onLogin}>
            <h2>Přihlášení</h2>
            <label>
              E-mail
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              Heslo
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <button type="submit" className="btn btn--primary btn--lg" disabled={busy}>
              Přihlásit
            </button>
          </form>
        ) : (
          <>
            <p className="admin__user">
              Přihlášen: <strong>{session.user.email}</strong>
            </p>

            <form className="admin__form" onSubmit={onUpload}>
              <h2>Nahrát fotografie</h2>
              <label>
                Soubory
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                required
              />
              </label>
              <label>
                Popisek (volitelný, společný)
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="např. Koupelna — Praha"
                />
              </label>
              <button type="submit" className="btn btn--primary btn--lg" disabled={busy}>
                {busy ? 'Nahrávám…' : 'Nahrát'}
              </button>
            </form>

            <section className="admin__list">
              <div className="admin__list-head">
                <h2>Nahrané ({remote.length})</h2>
                <button type="button" className="btn btn--outline btn--sm" onClick={refresh} disabled={busy}>
                  Obnovit
                </button>
              </div>
              {remote.length === 0 ? (
                <p className="gallery-empty">Zatím žádné nahrané fotografie.</p>
              ) : (
                <div className="admin__thumbs">
                  {remote.map((item) => (
                    <figure key={item.id}>
                      <img src={item.image} alt={item.title} loading="lazy" />
                      <figcaption>{item.title}</figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}
