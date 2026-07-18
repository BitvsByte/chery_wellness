import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Services from './components/Services.jsx'
import EventsTicker from './components/EventsTicker.jsx'
import About from './components/About.jsx'
import Testimonials from './components/Testimonials.jsx'
import Gallery from './components/Gallery.jsx'
import Faq from './components/Faq.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import SectionDivider from './components/ui/SectionDivider.jsx'

export default function App() {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only z-[60] rounded-lg bg-bright px-4 py-3 font-semibold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Saltar al contenido principal
      </a>
      <Header />
      <main id="contenido">
        <Hero />
        <Services />
        <EventsTicker />
        <SectionDivider />
        <About />
        <SectionDivider />
        <Testimonials />
        <SectionDivider />
        <Gallery />
        <SectionDivider />
        <Faq />
        <SectionDivider />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
