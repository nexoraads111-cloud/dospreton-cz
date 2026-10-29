export default function Logo({ className = '' }) {
  return (
    <a href="#/" className={`logo ${className}`} aria-label="DOSPRETON s.r.o. — Domů">
      <svg
        className="logo__mark"
        viewBox="0 0 48 48"
        width="44"
        height="44"
        aria-hidden="true"
      >
        <rect x="4" y="22" width="12" height="20" fill="currentColor" />
        <rect x="18" y="12" width="12" height="30" fill="currentColor" />
        <rect x="32" y="4" width="12" height="38" fill="currentColor" />
      </svg>
      <span className="logo__text">
        <span className="logo__name">DOSPRETON s.r.o.</span>
        <span className="logo__tag">STAVEBNÍ FIRMA</span>
      </span>
    </a>
  )
}
