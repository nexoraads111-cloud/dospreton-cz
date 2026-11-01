import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useInView } from '../hooks/useInView'
import { fetchApprovedReviews, submitReview } from '../lib/reviews-api'
import { isSupabaseConfigured } from '../lib/supabase'

function Stars({ value }) {
  if (value == null || value === '') return null
  const n = Math.max(1, Math.min(5, Number(value) || 5))
  return (
    <span className="review-stars" aria-label={`${n} z 5`}>
      {'★'.repeat(n)}
      <span className="review-stars__empty">{'★'.repeat(5 - n)}</span>
    </span>
  )
}

function resetFormState() {
  return { name: '', body: '', rating: '' }
}

export default function Reviews() {
  const [ref, inView] = useInView()
  const titleId = useId()
  const nameRef = useRef(null)
  const closeTimer = useRef(null)

  const [items, setItems] = useState([])
  const [loadState, setLoadState] = useState(isSupabaseConfigured ? 'loading' : 'off')
  const [modalOpen, setModalOpen] = useState(false)
  const [fields, setFields] = useState(resetFormState)
  const [sending, setSending] = useState(false)
  const [formMsg, setFormMsg] = useState(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    ;(async () => {
      try {
        const rows = await fetchApprovedReviews()
        if (!cancelled) {
          setItems(rows)
          setLoadState('ready')
        }
      } catch {
        if (!cancelled) setLoadState('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!modalOpen) return undefined

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape' && !sending) closeModal()
    }
    window.addEventListener('keydown', onKey)
    const t = window.setTimeout(() => nameRef.current?.focus(), 40)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(t)
    }
  }, [modalOpen, sending])

  useEffect(
    () => () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current)
    },
    [],
  )

  function openModal() {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setFields(resetFormState())
    setFormMsg(null)
    setSending(false)
    setModalOpen(true)
  }

  function closeModal() {
    if (sending) return
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setModalOpen(false)
    setFormMsg(null)
    setFields(resetFormState())
  }

  async function onSubmit(e) {
    e.preventDefault()
    setFormMsg(null)
    setSending(true)
    try {
      const ratingValue =
        fields.rating === '' || fields.rating == null ? null : Number(fields.rating)
      const res = await submitReview({
        authorName: fields.name,
        body: fields.body,
        rating: ratingValue,
      })
      setFormMsg({
        tone: 'ok',
        text:
          res?.message ||
          'Děkujeme. Recenze byla odeslána a po schválení se zobrazí na webu.',
      })
      setFields(resetFormState())
      closeTimer.current = window.setTimeout(() => {
        setModalOpen(false)
        setFormMsg(null)
        closeTimer.current = null
      }, 2200)
    } catch (err) {
      setFormMsg({
        tone: 'error',
        text: err?.message || 'Odeslání se nezdařilo. Zkuste to prosím později.',
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="recenze" className="reviews section section--dark" ref={ref}>
      <div className="container">
        <header className={`section-head ${inView ? 'is-visible' : ''}`}>
          <p className="section-eyebrow section-eyebrow--gold">RECENZE</p>
          <h2 className="section-title section-title--light">
            Co říkají <em>zákazníci</em>
          </h2>
          <p className="reviews__lead">
            Přečtěte si zkušenosti klientů. Chcete přidat vlastní? Nechte nám recenzi — před
            zveřejněním ji schválíme.
          </p>
        </header>

        {loadState === 'loading' && <p className="gallery-status">Načítám recenze…</p>}
        {loadState === 'error' && (
          <p className="gallery-status gallery-status--warn">
            Recenze se nepodařilo načíst. Zkuste obnovit stránku.
          </p>
        )}
        {loadState === 'off' && (
          <p className="gallery-status gallery-status--warn">
            Online recenze nejsou nakonfigurovány.
          </p>
        )}

        {items.length > 0 && (
          <div className={`reviews__grid ${inView ? 'is-visible' : ''}`}>
            {items.map((item, i) => (
              <article key={item.id} className="review-card" style={{ '--i': i }}>
                <Stars value={item.rating} />
                <p className="review-card__body">{item.body}</p>
                <p className="review-card__author">{item.authorName}</p>
              </article>
            ))}
          </div>
        )}

        {loadState === 'ready' && items.length === 0 && (
          <p className="reviews__empty">Zatím tu nejsou schválené recenze — buďte první.</p>
        )}

        <div className={`reviews__cta ${inView ? 'is-visible' : ''}`}>
          <button
            type="button"
            className="btn btn--primary btn--lg"
            onClick={openModal}
            disabled={!isSupabaseConfigured}
          >
            Zanechat recenzi
          </button>
          <p className="reviews__hint">
            Recenzi před zveřejněním zkontrolujeme. Veřejně se zobrazí až po schválení.
          </p>
        </div>
      </div>

      {modalOpen &&
        createPortal(
          <div
            className="review-modal"
            role="presentation"
            onClick={(e) => {
              if (e.target === e.currentTarget && !sending) closeModal()
            }}
          >
            <div
              className="review-modal__panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
            >
              <button
                type="button"
                className="review-modal__close"
                aria-label="Zavřít"
                onClick={closeModal}
                disabled={sending}
              >
                ×
              </button>
              <h3 id={titleId}>Zanechat recenzi</h3>
              <p className="review-modal__lead">
                Napište krátce, jak probíhala spolupráce. Po odeslání recenzi schválíme e-mailem.
              </p>

              <form className="reviews__form reviews__form--modal" onSubmit={onSubmit}>
                <label>
                  Jméno
                  <input
                    ref={nameRef}
                    name="author"
                    type="text"
                    required
                    minLength={2}
                    maxLength={80}
                    autoComplete="name"
                    value={fields.name}
                    onChange={(e) => setFields((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Jan Novák"
                    disabled={sending || formMsg?.tone === 'ok'}
                  />
                </label>
                <fieldset className="reviews__rating">
                  <legend>Hodnocení (volitelné)</legend>
                  <label className="reviews__rating-opt">
                    <input
                      type="radio"
                      name="rating"
                      value=""
                      checked={fields.rating === ''}
                      onChange={() => setFields((f) => ({ ...f, rating: '' }))}
                      disabled={sending || formMsg?.tone === 'ok'}
                    />
                    Bez hodnocení
                  </label>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <label key={n} className="reviews__rating-opt">
                      <input
                        type="radio"
                        name="rating"
                        value={n}
                        checked={fields.rating === String(n)}
                        onChange={() => setFields((f) => ({ ...f, rating: String(n) }))}
                        disabled={sending || formMsg?.tone === 'ok'}
                      />
                      {n}★
                    </label>
                  ))}
                </fieldset>
                <label>
                  Text recenze
                  <textarea
                    name="body"
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={5}
                    value={fields.body}
                    onChange={(e) => setFields((f) => ({ ...f, body: e.target.value }))}
                    placeholder="Jak probíhala spolupráce, výsledek práce…"
                    disabled={sending || formMsg?.tone === 'ok'}
                  />
                </label>
                <div className="review-modal__actions">
                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={sending || !isSupabaseConfigured || formMsg?.tone === 'ok'}
                  >
                    {sending ? 'Odesílám…' : 'Odeslat recenzi'}
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={closeModal}
                    disabled={sending}
                  >
                    Zavřít
                  </button>
                </div>
                {formMsg && (
                  <p className={`reviews__msg reviews__msg--${formMsg.tone}`} role="status">
                    {formMsg.text}
                  </p>
                )}
              </form>
            </div>
          </div>,
          document.body,
        )}
    </section>
  )
}
