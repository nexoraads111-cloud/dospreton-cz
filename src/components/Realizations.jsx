import { useMemo, useState } from 'react'
import { useInView } from '../hooks/useInView'
import { useGallery } from '../gallery-context'
import { useLightbox } from '../lightbox-context'

export default function Realizations() {
  const [ref, inView] = useInView()
  const [filter, setFilter] = useState('all')
  const { items, filters, status, configured } = useGallery()
  const { openAt } = useLightbox()

  const visibleFilters = useMemo(() => {
    const hasUploaded = items.some((i) => i.category === 'nahrane')
    return filters.filter((f) => f.id !== 'nahrane' || hasUploaded || configured)
  }, [filters, items, configured])

  const filtered = useMemo(() => {
    if (filter === 'all') return items
    return items.filter((g) => g.category === filter)
  }, [filter, items])

  return (
    <section id="realizace" className="realizations section" ref={ref}>
      <div className="container">
        <header className={`section-head ${inView ? 'is-visible' : ''}`}>
          <p className="section-eyebrow">REALIZACE</p>
          <h2 className="section-title">
            Naše práce <em>v praxi</em>
          </h2>
          {status === 'loading' && (
            <p className="gallery-status">Načítám galerii…</p>
          )}
          {status === 'error' && (
            <p className="gallery-status gallery-status--warn">
              Online galerii se nepodařilo načíst — zobrazuji lokální fotografie.
            </p>
          )}
        </header>

        <div
          className={`gallery-filters ${inView ? 'is-visible' : ''}`}
          role="tablist"
          aria-label="Filtr kategorií"
        >
          {visibleFilters.map((cat) => (
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

        <div className={`gallery-grid ${inView ? 'is-visible' : ''}`} key={`${filter}-${filtered.length}`}>
          {filtered.length === 0 ? (
            <p className="gallery-empty">V této kategorii zatím nejsou fotografie.</p>
          ) : (
            filtered.map((item, i) => {
              const fullIndex = items.findIndex((g) => g.id === item.id)
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
