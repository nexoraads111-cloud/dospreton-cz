import { useEffect, useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Services from './components/Services'
import About from './components/About'
import Realizations from './components/Realizations'
import Contact from './components/Contact'
import Lightbox from './components/Lightbox'
import AdminPage from './components/AdminPage'
import { GalleryProvider } from './gallery-context'
import { LightboxProvider } from './lightbox-context'

function Landing() {
  return (
    <GalleryProvider>
      <LightboxProvider>
        <Header />
        <main>
          <Hero />
          <Services />
          <About />
          <Realizations />
        </main>
        <Contact />
        <Lightbox />
      </LightboxProvider>
    </GalleryProvider>
  )
}

function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '')
  if (hash === 'admin') return 'admin'
  return 'home'
}

export default function App() {
  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    const onHash = () => setRoute(getRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (route === 'admin') return <AdminPage />
  return <Landing />
}
