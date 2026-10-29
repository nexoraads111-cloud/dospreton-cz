import { useInView } from '../hooks/useInView'
import { company } from '../company'
import { photos } from '../photos'
import { useLightbox } from '../lightbox-context'

const POINTS = [
  'Precizní provedení obkladů a dlažeb',
  'Dodržování termínů a domluveného rozpočtu',
  'Individuální přístup ke každé zakázce',
  'Práce v Praze i po celé ČR',
]

export default function About() {
  const [ref, inView] = useInView()
  const { openImage } = useLightbox()

  return (
    <section id="o-nas" className="about section section--dark" ref={ref}>
      <div className={`container about__inner ${inView ? 'is-visible' : ''}`}>
        <div className="about__copy">
          <p className="section-eyebrow section-eyebrow--gold">O NÁS</p>
          <h2 className="section-title section-title--light">
            Spolehlivý partner <em>ve stavebnictví</em>
          </h2>
          <p className="about__text">
            Jsme {company.name} se sídlem v Praze–Bohnicích. Zaměřujeme se na kvalitní obklady a
            dlažby, rekonstrukce koupelen, fasády a kámen i schodiště — od první konzultace po
            předání díla.
          </p>
          <ul className="about__points">
            {POINTS.map((p) => (
              <li key={p}>
                <span aria-hidden="true">✓</span>
                {p}
              </li>
            ))}
          </ul>
          <a href="#kontakt" className="btn btn--primary">
            NEZÁVAZNÁ POPTÁVKA
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <button
          type="button"
          className="about__photo"
          onClick={() => openImage(photos.about)}
          aria-label="Otevřít fotografii realizace"
        >
          <img
            src={photos.about}
            alt="Realizace DOSPRETON — dlažba a obklady"
            loading="lazy"
            decoding="async"
            width={900}
            height={1100}
          />
        </button>
      </div>
    </section>
  )
}
