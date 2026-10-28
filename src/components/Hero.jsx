import { company } from '../company'
import { photos } from '../photos'

const HERO_IMG = photos.hero

const BADGES = [
  { label: 'Kvalita a spolehlivost', icon: 'shield' },
  { label: 'Profesionální přístup', icon: 'people' },
  { label: 'Individuální přístup ke každé zakázce', icon: 'handshake' },
]

export default function Hero() {
  return (
    <section id="domu" className="hero">
      <div className="hero__media" aria-hidden="true">
        <img src={HERO_IMG} alt="" className="hero__img" />
        <div className="hero__overlay" />
        <div className="hero__diagonal" />
      </div>

      <div className="hero__content container">
        <p className="hero__eyebrow reveal reveal--1">STAVÍME KVALITNĚ A SPOLEHLIVĚ</p>
        <h1 className="hero__title reveal reveal--2">
          {company.name}
          <span>{company.tagline}</span>
        </h1>
        <p className="hero__lead reveal reveal--3">
          Obklady a dlažby, zateplování fasád, rekonstrukce bytů a domů a veškeré stavební práce.
        </p>

        <div className="hero__actions reveal reveal--4">
          <a href="#kontakt" className="btn btn--primary btn--lg">
            NEZÁVAZNÁ POPTÁVKA
            <span aria-hidden="true">→</span>
          </a>
          <a href={`tel:${company.phoneLinks[0]}`} className="btn btn--outline btn--lg">
            <PhoneIcon />
            {company.phones[0]}
          </a>
        </div>

        <ul className="hero__badges reveal reveal--5">
          {BADGES.map((b) => (
            <li key={b.label}>
              <BadgeIcon type={b.icon} />
              <span>{b.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <aside className="hero__card reveal reveal--6" aria-label="Kontaktní telefony">
        <div className="hero__card-icon">
          <PhoneIcon large />
        </div>
        <div className="hero__card-phones">
          {company.phones.map((phone, i) => (
            <a key={phone} href={`tel:${company.phoneLinks[i]}`}>
              +420 {phone}
            </a>
          ))}
        </div>
      </aside>
    </section>
  )
}

function PhoneIcon({ large = false }) {
  const size = large ? 28 : 18
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"
        fill="currentColor"
      />
    </svg>
  )
}

function BadgeIcon({ type }) {
  if (type === 'people') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M16 11a3 3 0 1 0-2.8-4H10.8A3 3 0 1 0 8 11c-2.2.4-4 2.3-4 4.7V18h16v-2.3c0-2.4-1.8-4.3-4-4.7z"
          fill="currentColor"
        />
      </svg>
    )
  }
  if (type === 'handshake') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12.5 11.5 9 8l1.5-1.5 3.5 3.5L17 7l1.5 1.5-6 6zm-7.2-.8L3 8.4 8.4 3l2.3 2.3L4.3 11.7zm14.4 0L19.7 8.4 14.3 3l-2.3 2.3 6.4 6.4zM8.5 14.5 7 16l5 5 1.5-1.5-5-5zm7 0-5 5L12 21l5-5-1.5-1.5z"
          fill="currentColor"
        />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3zm0 10.5 5-2.5V7l-5 2.5L7 7v3l5 2.5z"
        fill="currentColor"
      />
    </svg>
  )
}
