import { useRef, useState } from 'react'
import { useInView } from '../hooks/useInView'
import { photos } from '../photos'

const ITEMS = photos.realizations

export default function Realizations() {
  const trackRef = useRef(null)
  const [ref, inView] = useInView()
  const [index, setIndex] = useState(0)

  const scrollBy = (dir) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector('.real-card')
    const step = card ? card.offsetWidth + 20 : 320
    const next = Math.max(0, Math.min(ITEMS.length - 1, index + dir))
    setIndex(next)
    track.scrollTo({ left: next * step, behavior: 'smooth' })
  }

  return (
    <section id="realizace" className="realizations section" ref={ref}>
      <div className="container">
        <header className={`section-head ${inView ? 'is-visible' : ''}`}>
          <p className="section-eyebrow">REALIZACE</p>
          <h2 className="section-title">
            Naše práce <em>v praxi</em>
          </h2>
        </header>
      </div>

      <div className={`realizations__wrap ${inView ? 'is-visible' : ''}`}>
        <button
          type="button"
          className="realizations__nav realizations__nav--prev"
          aria-label="Předchozí"
          onClick={() => scrollBy(-1)}
        >
          ‹
        </button>

        <div className="realizations__track" ref={trackRef}>
          {ITEMS.map((item) => (
            <article key={item.title} className="real-card">
              <img src={item.image} alt={item.title} loading="lazy" />
              <div className="real-card__caption">
                <span>{item.title}</span>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          className="realizations__nav realizations__nav--next"
          aria-label="Další"
          onClick={() => scrollBy(1)}
        >
          ›
        </button>
      </div>

      <div className="realizations__cta">
        <a href="#kontakt" className="btn btn--primary btn--lg">
          ZOBRAZIT VŠECHNY REALIZACE <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  )
}
