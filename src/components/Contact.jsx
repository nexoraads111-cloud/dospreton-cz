import { useInView } from '../hooks/useInView'
import { company } from '../company'
import Logo from './Logo'

export default function Contact() {
  const [ref, inView] = useInView()

  return (
    <footer id="kontakt" className="contact" ref={ref}>
      <div className={`container contact__inner ${inView ? 'is-visible' : ''}`}>
        <header className="section-head section-head--center">
          <p className="section-eyebrow section-eyebrow--light">KONTAKT</p>
          <h2 className="section-title section-title--light">Ozvěte se nám</h2>
        </header>

        <div className="contact__bar">
          <a className="contact__item" href={`tel:${company.phoneLinks[0]}`}>
            <span className="contact__icon">
              <PhoneIcon />
            </span>
            <span>
              <strong>Telefon</strong>
              <span>
                {company.phones[0]} / {company.phones[1]}
              </span>
            </span>
          </a>

          <a className="contact__item" href={`mailto:${company.email}`}>
            <span className="contact__icon">
              <MailIcon />
            </span>
            <span>
              <strong>E-mail</strong>
              <span>{company.email}</span>
            </span>
          </a>

          <div className="contact__item">
            <span className="contact__icon">
              <PinIcon />
            </span>
            <span>
              <strong>Působnost</strong>
              <span>{company.areaFull}</span>
            </span>
          </div>

          <a href={`mailto:${company.email}`} className="btn btn--primary btn--lg contact__cta">
            <MailIcon />
            NEZÁVAZNÁ POPTÁVKA
          </a>
        </div>

        <div className="contact__legal">
          <Logo className="logo--footer" />
          <div className="contact__legal-text">
            <p>
              <strong>{company.name}</strong>
            </p>
            <p>{company.address.full}</p>
            <p>
              IČO: {company.ico} · DIČ: {company.dic}
            </p>
            <p>Datová schránka: {company.datovaSchranka}</p>
          </div>
        </div>

        <p className="contact__copy">
          © {new Date().getFullYear()} {company.name}. Všechna práva vyhrazena.
        </p>
      </div>
    </footer>
  )
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"
        fill="currentColor"
      />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm8 7L4.5 7.5h15L12 13z"
        fill="currentColor"
      />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"
        fill="currentColor"
      />
    </svg>
  )
}
