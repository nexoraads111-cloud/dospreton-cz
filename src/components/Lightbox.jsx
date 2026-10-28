import { useRef } from 'react'
import { useLightbox } from '../lightbox-context'

export default function Lightbox() {
  const { open, item, index, total, close, prev, next } = useLightbox()
  const touchX = useRef(null)

  if (!open || !item) return null

  const onTouchStart = (e) => {
    touchX.current = e.changedTouches[0].clientX
  }

  const onTouchEnd = (e) => {
    if (touchX.current == null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    touchX.current = null
    if (Math.abs(dx) < 40) return
    if (dx > 0) prev()
    else next()
  }

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={close}
    >
      <button type="button" className="lightbox__close" aria-label="Zavřít" onClick={close}>
        ×
      </button>

      <button
        type="button"
        className="lightbox__nav lightbox__nav--prev"
        aria-label="Předchozí foto"
        onClick={(e) => {
          e.stopPropagation()
          prev()
        }}
      >
        ‹
      </button>

      <figure
        className="lightbox__figure"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img src={item.image} alt={item.title} />
        <figcaption>
          <span>{item.title}</span>
          <span className="lightbox__count">
            {index + 1} / {total}
          </span>
        </figcaption>
      </figure>

      <button
        type="button"
        className="lightbox__nav lightbox__nav--next"
        aria-label="Další foto"
        onClick={(e) => {
          e.stopPropagation()
          next()
        }}
      >
        ›
      </button>
    </div>
  )
}
