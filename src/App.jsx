import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import TrainingPage from './pages/TrainingPage.jsx'
import PosingPage from './pages/PosingPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import ScrollToHash from './components/ScrollToHash.jsx'
import DocumentHead from './components/DocumentHead.jsx'
import { ROUTES } from './data/plans.js'

export default function App() {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only z-[60] rounded-lg bg-bright px-4 py-3 font-semibold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Saltar al contenido principal
      </a>
      <DocumentHead />
      <ScrollToHash />
      <Header />
      <main id="contenido">
        <Routes>
          <Route path={ROUTES.home} element={<Home />} />
          <Route path={ROUTES.training} element={<TrainingPage />} />
          <Route path={ROUTES.posing} element={<PosingPage />} />
          {/* Sin comodín, una URL desconocida dejaba `#contenido` vacío: un
              200 en blanco con el <head> de la portada, indexable como
              soft-404. */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
