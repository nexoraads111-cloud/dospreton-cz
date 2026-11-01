import { useEffect, useState } from 'react'
import { useInView } from '../hooks/useInView'
import { fetchApprovedReviews, submitReview } from '../lib/reviews-api'
import { isSupabaseConfigured } from '../lib/supabase'

function Stars({ value }) {
  const n = Math.max(1, Math.min(5, Number(value) || 5))
  return (
    <span className="review-stars" aria-label={`${n} z 5`}>
      {'★'.repeat(n)}
      <span className="review-stars__empty">{'★'.repeat(5 - n)}</span>
    </span>
  )
}

export default function Reviews() {
  const [ref, inView] = useInView()
  const [items, setItems] = useState([])
  const [loadState, setLoadState] = useState(isSupabaseConfigured ? 'loading' : 'off')
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [rating, setRating] = useState(5)
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

  async function onSubmit(e) {
    e.preventDefault()
    setFormMsg(null)
    setSending(true)
    try {
      const res = await submitReview({ authorName: name, body, rating })
      setFormMsg({
        tone: 'ok',
        text:
          res?.message ||
          'Děkujeme. Recenze byla odeslána a po schválení se zobrazí na webu.',
      })
      setName('')
      setBody('')
      setRating(5)
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
            Přečtěte si zkušenosti klientů. Chcete přidat vlastní? Vyplňte formulář níže — před
            zveřejněním recenzi schválíme.
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

        <form
          id="zanechat-recenzi"
          className={`reviews__form ${inView ? 'is-visible' : ''}`}
          onSubmit={onSubmit}
        >
          <h3>Zanechat recenzi</h3>
          <label>
            Jméno
            <input
              name="author"
              type="text"
              required
              minLength={2}
              maxLength={80}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jan Novák"
            />
          </label>
          <fieldset className="reviews__rating">
            <legend>Hodnocení</legend>
            {[5, 4, 3, 2, 1].map((n) => (
              <label key={n} className="reviews__rating-opt">
                <input
                  type="radio"
                  name="rating"
                  value={n}
                  checked={rating === n}
                  onChange={() => setRating(n)}
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
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Jak probíhala spolupráce, výsledek práce…"
            />
          </label>
          <button type="submit" className="btn btn--primary" disabled={sending || !isSupabaseConfigured}>
            {sending ? 'Odesílám…' : 'Odeslat recenzi'}
          </button>
          {formMsg && (
            <p className={`reviews__msg reviews__msg--${formMsg.tone}`} role="status">
              {formMsg.text}
            </p>
          )}
          <p className="reviews__hint">
            Po odeslání recenzi zkontrolujeme e-mailem. Veřejně se zobrazí až po schválení.
          </p>
        </form>
      </div>
    </section>
  )
}
