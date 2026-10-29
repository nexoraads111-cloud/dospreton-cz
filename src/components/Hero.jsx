import { company } from '../company'
import { photos } from '../photos'

const HERO_IMG = photos.hero

export default function Hero() {
  return (
    <section id="domu" className="hero">
      <div className="hero__media" aria-hidden="true">
        <img
          src={HERO_IMG}
          alt=""
          className="hero__img"
          width={1600}
          height={1067}
          fetchPriority="high"
          decoding="async"
        />
        <div className="hero__overlay" />
        <div className="hero__grain" />
        <div className="hero__diagonal" />
      </div>

      <div className="hero__content container">
        <p className="hero__brand reveal reveal--1">{company.name}</p>
        <h1 className="hero__title reveal reveal--2">
          KVALITNĚ.
          <br />
          PŘESNĚ.
          <br />
          SPOLEHLIVĚ.
        </h1>
        <p className="hero__lead reveal reveal--3">
          Obklady a dlažby, rekonstrukce koupelen a stavební práce.
        </p>

        <div className="hero__actions reveal reveal--4">
          <a href="#kontakt" className="btn btn--primary btn--lg">
            NEZÁVAZNÁ POPTÁVKA
            <span aria-hidden="true">→</span>
          </a>
          <a href="#realizace" className="btn btn--ghost btn--lg">
            NAŠE REALIZACE
          </a>
        </div>
      </div>
    </section>
  )
}
