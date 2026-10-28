import { useInView } from '../hooks/useInView'
import { company } from '../company'

const STATS = [
  { value: '1 000+', label: 'Realizovaných zakázek', icon: 'check' },
  { value: '100%', label: 'Spokojení zákazníci', icon: 'users' },
  { value: 'Od 2020', label: 'Dlouholeté zkušenosti', icon: 'calendar' },
  { value: 'A+', label: 'Kvalitní materiály', icon: 'gem' },
]

export default function About() {
  const [ref, inView] = useInView()

  return (
    <section id="o-nas" className="about" ref={ref}>
      <div className="about__accent" aria-hidden="true" />
      <div className={`container about__inner ${inView ? 'is-visible' : ''}`}>
        <div className="about__copy">
          <p className="section-eyebrow section-eyebrow--light">O NÁS</p>
          <h2 className="section-title section-title--light">
            Spolehlivý partner ve stavebnictví
          </h2>
          <p className="about__text">
            Jsme stavební firma {company.name} se sídlem v Praze–Bohnicích. Zaměřujeme se na
            precizní provedení, dodržování termínů a individuální přístup ke každé zakázce —
            od obkladů a dlažeb přes zateplování fasád až po kompletní rekonstrukce bytů a domů.
            Působíme v Praze a okolí i po celé České republice.
          </p>
          <a href="#kontakt" className="text-link">
            VÍCE O NÁS <span aria-hidden="true">→</span>
          </a>
        </div>

        <ul className="about__stats">
          {STATS.map((stat, i) => (
            <li key={stat.label} style={{ '--i': i }}>
              <div className="about__stat-icon">
                <StatIcon type={stat.icon} />
              </div>
              <div>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function StatIcon({ type }) {
  const props = { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true }
  if (type === 'users') {
    return (
      <svg {...props}>
        <path
          d="M16 11a3 3 0 1 0-2.8-4H10.8A3 3 0 1 0 8 11c-2.2.4-4 2.3-4 4.7V18h16v-2.3c0-2.4-1.8-4.3-4-4.7z"
          fill="currentColor"
        />
      </svg>
    )
  }
  if (type === 'calendar') {
    return (
      <svg {...props}>
        <path
          d="M7 3v2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2V3h-2v2H9V3H7zm12 8H5v8h14v-8z"
          fill="currentColor"
        />
      </svg>
    )
  }
  if (type === 'gem') {
    return (
      <svg {...props}>
        <path d="m12 2 4 6-4 14L8 8l4-6zm0 3.2L9.8 8h4.4L12 5.2z" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg {...props}>
      <path
        d="M9.5 16.5 5 12l1.4-1.4 3.1 3.1 7.1-7.1L18 8l-8.5 8.5z"
        fill="currentColor"
      />
    </svg>
  )
}
