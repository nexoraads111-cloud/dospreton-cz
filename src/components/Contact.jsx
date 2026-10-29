import { useInView } from '../hooks/useInView'
import { company } from '../company'
import { photos } from '../photos'
import Logo from './Logo'

const CHECKLIST = [
  'Kvalitní materiály',
  'Zkušený tým',
  'Dodržení termínů',
  'Čistá a přesná práce',
  'Individuální přístup',
  'Práce po celé ČR',
]

export default function Contact() {
  const [ref, inView] = useInView()

  return (
    <footer id="kontakt" className="contact" ref={ref}>
      <div className="contact__bg" aria-hidden="true">
        <img
          src={photos.contactBg}
          alt=""
          loading="lazy"
          decoding="async"
          width={900}
          height={700}
        />
      </div>
      <div className="contact__shade" aria-hidden="true" />

      <div className={`container contact__inner ${inView ? 'is-visible' : ''}`}>
        <div className="contact__grid">
          <div className="contact__intro">
            <p className="section-eyebrow section-eyebrow--gold">KONTAKT</p>
            <h2 className="section-title section-title--light">
              Máte projekt? <em>Ozvěte se nám</em>
            </h2>
            <p className="contact__lead">
              Domluvíme nezávaznou konzultaci, prohlédneme si prostor a připravíme férovou nabídku
              na míru vaší zakázce.
            </p>
            <a href={`mailto:${company.email}?subject=Nezávazná%20poptávka`} className="btn btn--primary btn--lg">
              NEZÁVAZNÁ POPTÁVKA
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="contact__details">
            <a className="contact__row" href={`tel:${company.phoneLinks[0]}`}>
              <span className="contact__label">Telefon</span>
              <strong>+420 {company.phones[0]}</strong>
              <span className="contact__muted">/ +420 {company.phones[1]}</span>
            </a>
            <a className="contact__row" href={`mailto:${company.email}`}>
              <span className="contact__label">E-mail</span>
              <strong>{company.email}</strong>
            </a>
            <div className="contact__row">
              <span className="contact__label">Působnost</span>
              <strong>{company.areaFull}</strong>
            </div>
            <div className="contact__row">
              <span className="contact__label">Sídlo</span>
              <strong>{company.address.full}</strong>
            </div>

            <div className="contact__social" aria-label="Komunikace a sítě">
              <a
                className="social-btn social-btn--wa"
                href={company.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`WhatsApp ${company.whatsapp}`}
              >
                <WhatsAppIcon />
                <span>WhatsApp</span>
              </a>
              <a
                className="social-btn social-btn--viber"
                href={company.viberUrl}
                aria-label={`Viber ${company.viber}`}
              >
                <ViberIcon />
                <span>Viber</span>
              </a>
              <a
                className="social-btn social-btn--tt"
                href={company.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok DOSPRETON"
              >
                <TikTokIcon />
                <span>TikTok</span>
              </a>
            </div>
          </div>

          <ul className="contact__checks">
            {CHECKLIST.map((item) => (
              <li key={item}>
                <span aria-hidden="true">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="contact__legal">
          <Logo className="logo--footer" />
          <div className="contact__legal-text">
            <p>
              <strong>{company.name}</strong>
            </p>
            <p>
              IČO: {company.ico} · DIČ: {company.dic}
            </p>
            <p>Datová schránka: {company.datovaSchranka}</p>
          </div>
        </div>

        <p className="contact__copy">
          © {new Date().getFullYear()} {company.name}. Všechna práva vyhrazena.
          <a className="contact__admin-link" href="./admin.html">
            Admin galerie
          </a>
        </p>
      </div>
    </footer>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.04 2C6.58 2 2.15 6.4 2.15 11.84c0 1.98.58 3.83 1.6 5.4L2 22l4.92-1.63a9.86 9.86 0 0 0 5.12 1.4h.01c5.46 0 9.89-4.4 9.89-9.84S17.5 2 12.04 2zm5.76 13.99c-.24.68-1.4 1.25-1.93 1.33-.5.08-1.13.11-1.82-.11-.42-.14-.96-.31-1.66-.61-2.92-1.26-4.82-4.2-4.97-4.4-.14-.19-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.59-.37.79-.37h.57c.18 0 .42-.07.66.5.24.59.82 2.02.89 2.17.07.15.12.32.02.52-.1.19-.15.32-.3.49-.14.17-.3.38-.43.51-.14.14-.29.29-.12.57.16.28.73 1.2 1.56 1.94 1.08.96 1.98 1.26 2.26 1.4.28.14.44.12.6-.07.17-.19.7-.81.89-1.09.19-.28.38-.23.64-.14.27.1 1.7.8 1.99.95.29.14.48.22.55.34.07.12.07.7-.17 1.38z"
      />
    </svg>
  )
}

function ViberIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M11.4 2C7.2 2.1 3.7 5.2 3.3 9.4c-.3 3.2.9 5.5 2.4 7.2V21l3.8-2.1c1 .3 2 .4 3 .4h.1c4.6-.1 8.3-3.8 8.3-8.4C20.9 5.6 16.5 1.9 11.4 2zm.2 15.1h-.1c-.9 0-1.8-.2-2.6-.5l-.2-.1-2.2 1.2.5-2.3-.2-.2c-1.4-1.5-2.2-3.4-2-5.5.4-3.3 3.2-5.8 6.5-5.8 3.6.1 6.5 3 6.5 6.6.1 3.6-2.9 6.6-6.4 6.6zm3.6-4.5c-.2-.1-1.2-.6-1.4-.7-.2-.1-.3-.1-.5.1s-.5.7-.7.8c-.1.1-.3.2-.5.1-.2-.1-.9-.3-1.8-1.1-.7-.6-1.1-1.3-1.3-1.5-.1-.2 0-.3.1-.4.1-.1.2-.3.3-.4.1-.1.1-.2.2-.4 0-.1 0-.3 0-.4s-.5-1.1-.6-1.5c-.2-.4-.4-.3-.5-.3h-.4c-.1 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.5 3.9 3.4.5.2 1 .4 1.3.5.6.2 1.1.1 1.5.1.5-.1 1.2-.5 1.4-1 .2-.5.2-.9.1-1 0-.1-.2-.1-.4-.2z"
      />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.6 7.1a5.7 5.7 0 0 1-3.4-1.1v7.2a5.5 5.5 0 1 1-4.7-5.4v2.7a2.8 2.8 0 1 0 2 2.7V2.5h2.6a5.7 5.7 0 0 0 3.5 4.6v2z"
      />
    </svg>
  )
}
