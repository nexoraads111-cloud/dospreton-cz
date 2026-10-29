import { company } from '../company'

export default function Logo({ className = '', compact = false }) {
  return (
    <a href="#domu" className={`logo ${compact ? 'logo--compact' : ''} ${className}`} aria-label={`${company.name} — Domů`}>
      <svg
        className="logo__mark"
        viewBox="0 0 48 48"
        width="42"
        height="42"
        aria-hidden="true"
      >
        <rect x="4" y="22" width="11" height="20" fill="currentColor" />
        <rect x="18" y="12" width="11" height="30" fill="currentColor" />
        <rect x="32" y="4" width="11" height="38" fill="currentColor" />
      </svg>
      <span className="logo__text">
        <span className="logo__name">{company.name}</span>
        <span className="logo__tag">{company.tagline}</span>
      </span>
    </a>
  )
}
