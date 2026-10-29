import { useEffect, useState } from 'react'
import Logo from './Logo'
import { company } from '../company'

const NAV = [
  { id: 'domu', label: 'Domů' },
  {
    id: 'sluzby',
    label: 'Služby',
    children: [
      { href: '#sluzby', label: 'Obklady a dlažby' },
      { href: '#sluzby', label: 'Rekonstrukce koupelen' },
      { href: '#sluzby', label: 'Fasády a kámen' },
      { href: '#sluzby', label: 'Schody' },
    ],
  },
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
      setScrolled(window.scrollY > 20)
      const sections = ['domu', 'sluzby', 'realizace', 'o-nas', 'kontakt']
        .map((id) => document.getElementById(id))
        .filter(Boolean)
      const y = window.scrollY + 110
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
              <li key={item.id} className={item.children ? 'has-dropdown' : undefined}>
                <a
                  href={`#${item.id}`}
                  className={active === item.id ? 'is-active' : ''}
                  onClick={close}
                >
                  {item.label}
                  {item.children ? <span className="nav-caret" aria-hidden="true">▾</span> : null}
                </a>
                {item.children ? (
                  <ul className="site-nav__dropdown" aria-label="Služby">
                    {item.children.map((child) => (
                      <li key={child.label}>
                        <a href={child.href} onClick={close}>
                          {child.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>

        <a href="#kontakt" className="btn btn--primary btn--sm site-header__cta">
          NEZÁVAZNÁ POPTÁVKA
          <span aria-hidden="true">→</span>
        </a>

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
          <a href={`tel:${company.phoneLinks[0]}`}>+420 {company.phones[0]}</a>
          <a href={`mailto:${company.email}`}>{company.email}</a>
          <a href="#kontakt" className="btn btn--primary" onClick={close}>
            NEZÁVAZNÁ POPTÁVKA →
          </a>
        </div>
      </div>
    </header>
  )
}
