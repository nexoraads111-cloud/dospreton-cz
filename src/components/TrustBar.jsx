import { useInView } from '../hooks/useInView'

const ITEMS = [
  {
    title: 'Precizní provedení',
    text: 'Důraz na detail a kvalitu',
    icon: 'diamond',
  },
  {
    title: 'Spolehlivý přístup',
    text: 'Dodržujeme termíny',
    icon: 'handshake',
  },
  {
    title: 'Individuální řešení',
    text: 'Podle vašich požadavků',
    icon: 'gear',
  },
  {
    title: 'Práce po celé ČR',
    text: 'Praha a okolí, celá Česká republika',
    icon: 'map',
  },
]

export default function TrustBar() {
  const [ref, inView] = useInView({ threshold: 0.2 })

  return (
    <section className={`trust-bar ${inView ? 'is-visible' : ''}`} aria-label="Proč DOSPRETON" ref={ref}>
      <div className="container trust-bar__grid">
        {ITEMS.map((item, i) => (
          <article key={item.title} className="trust-bar__item" style={{ '--i': i }}>
            <span className="trust-bar__icon" aria-hidden="true">
              <TrustIcon type={item.icon} />
            </span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function TrustIcon({ type }) {
  const props = { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true }
  if (type === 'handshake') {
    return (
      <svg {...props}>
        <path
          d="M12.5 11.5 9 8l1.5-1.5 3.5 3.5L17 7l1.5 1.5-6 6zm-7.2-.8L3 8.4 8.4 3l2.3 2.3L4.3 11.7zm14.4 0L19.7 8.4 14.3 3l-2.3 2.3 6.4 6.4zM8.5 14.5 7 16l5 5 1.5-1.5-5-5zm7 0-5 5L12 21l5-5-1.5-1.5z"
          fill="currentColor"
        />
      </svg>
    )
  }
  if (type === 'gear') {
    return (
      <svg {...props}>
        <path
          d="M19.4 13a7.7 7.7 0 0 0 0-2l2-1.5-2-3.5-2.4 1a7.4 7.4 0 0 0-1.7-1L15 3h-4l-.3 2.9a7.4 7.4 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7.7 7.7 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7.4 7.4 0 0 0 1.7 1L11 21h4l.3-2.9a7.4 7.4 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z"
          fill="currentColor"
        />
      </svg>
    )
  }
  if (type === 'map') {
    return (
      <svg {...props}>
        <path
          d="M3 6.5 9 4l6 2.5L21 4v15.5L15 22l-6-2.5L3 22V6.5zm8 1.2v11.1l2 .8V8.5l-2-.8zM5 8.2v11.1l4-1.7V6.5L5 8.2zm14 9.1V6.1l-4 1.7v11.1l4-1.6z"
          fill="currentColor"
        />
      </svg>
    )
  }
  return (
    <svg {...props}>
      <path d="m12 2 3.1 6.3L22 9.3l-5 4.9 1.2 7L12 17.8 5.8 21.2 7 14.2 2 9.3l6.9-1L12 2z" fill="currentColor" />
    </svg>
  )
}
