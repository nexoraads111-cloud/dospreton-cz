import { useMemo, useState } from 'react'
import { useInView } from '../hooks/useInView'
import { CATEGORIES, gallery } from '../photos'
import { useLightbox } from '../lightbox-context'

export default function Realizations() {
  const [ref, inView] = useInView()
  const [filter, setFilter] = useState('all')
  const { openAt } = useLightbox()

  const items = useMemo(() => {
    if (filter === 'all') return gallery
    return gallery.filter((g) => g.category === filter)
  }, [filter])

  return (
    <section id="realizace" className="realizations section" ref={ref}>
      <div className="container">
        <header className={`section-head ${inView ? 'is-visible' : ''}`}>
          <p className="section-eyebrow">REALIZACE</p>
          <h2 className="section-title">
            Naše práce <em>v praxi</em>
          </h2>
        </header>

        <div
          className={`gallery-filters ${inView ? 'is-visible' : ''}`}
          role="tablist"
          aria-label="Filtr kategorií"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={filter === cat.id}
              className={`gallery-filters__btn ${filter === cat.id ? 'is-active' : ''}`}
              onClick={() => setFilter(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className={`gallery-grid ${inView ? 'is-visible' : ''}`} key={filter}>
          {items.length === 0 ? (
            <p className="gallery-empty">V této kategorii zatím nejsou fotografie.</p>
          ) : (
            items.map((item, i) => {
              const fullIndex = gallery.findIndex((g) => g.id === item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  className="gallery-card"
                  style={{ '--i': i }}
                  onClick={() => openAt(fullIndex)}
                  aria-label={`Otevřít: ${item.title}`}
                >
                  <img src={item.image} alt={item.title} loading="lazy" />
                  <span className="gallery-card__caption">
                    <span>{item.title}</span>
                    <span className="gallery-card__zoom" aria-hidden="true">
                      ↗
                    </span>
                  </span>
                </button>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}
