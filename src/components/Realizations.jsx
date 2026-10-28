import { useRef, useState } from 'react'
import { useInView } from '../hooks/useInView'

const ITEMS = [
  {
    title: 'Koupelna — obklady',
    image:
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Fasáda rodinného domu',
    image:
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Rekonstrukce interiéru',
    image:
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Stavební práce',
    image:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Moderní bydlení',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Venkovní úpravy',
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=700&q=80',
  },
]

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
