import Header from './components/Header'
import Hero from './components/Hero'
import Services from './components/Services'
import About from './components/About'
import Realizations from './components/Realizations'
import Contact from './components/Contact'
import Lightbox from './components/Lightbox'
import { GalleryProvider } from './gallery-context'
import { LightboxProvider } from './lightbox-context'

export default function App() {
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
