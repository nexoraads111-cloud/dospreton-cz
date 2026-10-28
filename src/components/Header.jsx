import { useEffect, useState } from 'react'
import Logo from './Logo'
import { company } from '../company'

const NAV = [
  { id: 'domu', label: 'Domů' },
  { id: 'sluzby', label: 'Služby' },
  { id: 'realizace', label: 'Realizace' },
  { id: 'o-nas', label: 'O nás' },
  { id: 'kontakt', label: 'Kontakt' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('domu')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24)

      const sections = NAV.map((n) => document.getElementById(n.id)).filter(Boolean)
      const y = window.scrollY + 120
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].offsetTop <= y) {
          setActive(sections[i].id)
          break
        }
      }
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <div className="site-header__inner">
        <Logo />

        <nav className="site-nav" aria-label="Hlavní navigace">
          <ul className="site-nav__list">
            {NAV.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={active === item.id ? 'is-active' : ''}
                  onClick={close}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__aside">
          <div className="site-header__phones">
            <PhoneIcon />
            <div>
              {company.phones.map((phone, i) => (
                <a key={phone} href={`tel:${company.phoneLinks[i]}`}>
                  +420 {phone}
                </a>
              ))}
            </div>
          </div>
          <a href="#kontakt" className="btn btn--primary btn--sm site-header__cta">
            <MailIcon />
            NEZÁVAZNÁ POPTÁVKA
          </a>
        </div>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Zavřít menu' : 'Otevřít menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div id="mobile-nav" className={`mobile-nav ${open ? 'is-open' : ''}`}>
        <ul>
          {NAV.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} onClick={close}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mobile-nav__contact">
          {company.phones.map((phone, i) => (
            <a key={phone} href={`tel:${company.phoneLinks[i]}`}>
              +420 {phone}
            </a>
          ))}
          <a href="#kontakt" className="btn btn--primary" onClick={close}>
            NEZÁVAZNÁ POPTÁVKA
          </a>
        </div>
      </div>
    </header>
  )
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"
        fill="currentColor"
      />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm8 7L4.5 7.5h15L12 13z"
        fill="currentColor"
      />
    </svg>
  )
}
