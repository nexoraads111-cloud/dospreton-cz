import { useInView } from '../hooks/useInView'
import { photos } from '../photos'
import { useLightbox } from '../lightbox-context'

const SERVICES = [
  {
    title: 'Obklady a dlažby',
    text: 'Precizní pokládka obkladů a dlažeb v interiérech i exteriérech — trvanlivý výsledek s důrazem na detail.',
    image: photos.services.tiles,
  },
  {
    title: 'Rekonstrukce koupelen',
    text: 'Kompletní rekonstrukce koupelen od demontáže po finální obklady, včetně instalací a detailů.',
    image: photos.services.bathroom,
  },
  {
    title: 'Fasády a kámen',
    text: 'Kamenné a fasádní obklady, které chrání stavbu a dávají domům charakter.',
    image: photos.services.facade,
  },
  {
    title: 'Schody',
    text: 'Schodiště a podesty s přesnou pokládkou — bezpečně, čistě a na dlouhá léta.',
    image: photos.services.stairs,
  },
]

export default function Services() {
  const [ref, inView] = useInView()
  const { openImage } = useLightbox()

  return (
    <section id="sluzby" className="services section section--dark" ref={ref}>
      <div className="container">
        <header className={`section-head ${inView ? 'is-visible' : ''}`}>
          <p className="section-eyebrow section-eyebrow--gold">CO NABÍZÍME</p>
          <h2 className="section-title section-title--light">
            Naše <em>služby</em>
          </h2>
        </header>

        <div className={`services__grid ${inView ? 'is-visible' : ''}`}>
          {SERVICES.map((service, i) => (
            <article key={service.title} className="service-card" style={{ '--i': i }}>
              <button
                type="button"
                className="service-card__media"
                onClick={() => openImage(service.image)}
                aria-label={`${service.title} — otevřít fotografii`}
              >
                <img
                  src={service.image}
                  alt={service.title}
                  loading="lazy"
                  decoding="async"
                  width={480}
                  height={600}
                  sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 25vw"
                />
              </button>
              <div className="service-card__body">
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <a href="#kontakt" className="text-link">
                  VÍCE INFORMACÍ <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
