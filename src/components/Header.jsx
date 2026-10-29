import { useEffect, useId, useRef, useState } from 'react'
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
  const navId = useId()
  const toggleRef = useRef(null)
  const panelRef = useRef(null)
  const firstLinkRef = useRef(null)

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
    const root = document.documentElement
    if (open) {
      root.classList.add('nav-open')
      // Focus first link for keyboard / screen readers
      requestAnimationFrame(() => firstLinkRef.current?.focus())
    } else {
      root.classList.remove('nav-open')
    }
    return () => root.classList.remove('nav-open')
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const close = () => setOpen(false)
  const toggle = () => setOpen((v) => !v)

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <div className="site-header__bar">
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
                    {item.children ? (
                      <span className="nav-caret" aria-hidden="true">
                        ▾
                      </span>
                    ) : null}
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
            ref={toggleRef}
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls={navId}
            aria-label={open ? 'Zavřít menu' : 'Otevřít menu'}
            onClick={toggle}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Backdrop: closes menu; sits under the panel, above page content */}
      <button
        type="button"
        className={`mobile-nav-backdrop ${open ? 'is-open' : ''}`}
        aria-label="Zavřít menu"
        tabIndex={open ? 0 : -1}
        onClick={close}
      />

      <nav
        id={navId}
        ref={panelRef}
        className={`mobile-nav ${open ? 'is-open' : ''}`}
        aria-label="Mobilní navigace"
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <ul>
          {NAV.map((item, i) => (
            <li key={item.id}>
              <a
                ref={i === 0 ? firstLinkRef : undefined}
                href={`#${item.id}`}
                onClick={close}
                tabIndex={open ? 0 : -1}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mobile-nav__contact">
          <a href={`tel:${company.phoneLinks[0]}`} tabIndex={open ? 0 : -1}>
            +420 {company.phones[0]}
          </a>
          <a href={`mailto:${company.email}`} tabIndex={open ? 0 : -1}>
            {company.email}
          </a>
          <a href="#kontakt" className="btn btn--primary" onClick={close} tabIndex={open ? 0 : -1}>
            NEZÁVAZNÁ POPTÁVKA →
          </a>
        </div>
      </nav>
    </header>
  )
}
