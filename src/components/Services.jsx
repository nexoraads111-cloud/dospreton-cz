import { useInView } from '../hooks/useInView'

const SERVICES = [
  {
    title: 'Obklady a dlažby',
    image:
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    icon: 'tiles',
  },
  {
    title: 'Zateplování fasád',
    image:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
    icon: 'house',
  },
  {
    title: 'Rekonstrukce bytů a domů',
    image:
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    icon: 'hammer',
  },
  {
    title: 'Stavební práce všeho druhu',
    image:
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80',
    icon: 'crane',
  },
]

export default function Services() {
  const [ref, inView] = useInView()

  return (
    <section id="sluzby" className="services section" ref={ref}>
      <div className="container">
        <header className={`section-head ${inView ? 'is-visible' : ''}`}>
          <p className="section-eyebrow">NAŠE SLUŽBY</p>
          <h2 className="section-title">
            Co pro Vás <em>provedeme?</em>
          </h2>
        </header>

        <div className={`services__grid ${inView ? 'is-visible' : ''}`}>
          {SERVICES.map((service, i) => (
            <a
              key={service.title}
              href="#kontakt"
              className="service-card"
              style={{ '--i': i }}
            >
              <div className="service-card__media">
                <img src={service.image} alt={service.title} loading="lazy" />
              </div>
              <div className="service-card__bar">
                <ServiceIcon type={service.icon} />
                <span>{service.title}</span>
                <span className="service-card__arrow" aria-hidden="true">
                  →
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceIcon({ type }) {
  const props = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true }
  if (type === 'house') {
    return (
      <svg {...props}>
        <path d="M12 3 3 10v11h6v-6h6v6h6V10L12 3z" fill="currentColor" />
      </svg>
    )
  }
  if (type === 'hammer') {
    return (
      <svg {...props}>
        <path
          d="m15.5 3.5 5 5-3 3-1.5-1.5-6.8 6.8a2 2 0 0 1-2.8 0l-.7-.7a2 2 0 0 1 0-2.8l6.8-6.8L11 5l3-3 1.5 1.5z"
          fill="currentColor"
        />
      </svg>
    )
  }
  if (type === 'crane') {
    return (
      <svg {...props}>
        <path
          d="M4 20h16v2H4v-2zm2-2V8h2v10H6zm5 0V4h2l7 6h-5v8h-4z"
          fill="currentColor"
        />
      </svg>
    )
  }
  return (
    <svg {...props}>
      <path
        d="M3 5h8v8H3V5zm10 0h8v4h-8V5zM3 15h4v4H3v-4zm6 0h12v4H9v-4z"
        fill="currentColor"
      />
    </svg>
  )
}
