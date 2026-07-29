import Hero from '../components/Hero.jsx'
import Areas from '../components/Areas.jsx'
import EventsTicker from '../components/EventsTicker.jsx'
import About from '../components/About.jsx'
import Testimonials from '../components/Testimonials.jsx'
import Gallery from '../components/Gallery.jsx'
import Faq from '../components/Faq.jsx'
import Contact from '../components/Contact.jsx'
import SectionDivider from '../components/ui/SectionDivider.jsx'

export default function Home() {
  return (
    <>
      <Hero />
      <Areas />
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
    </>
  )
}
