import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import ScrollToHash from './components/ScrollToHash.jsx'
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
      <ScrollToHash />
      <Header />
      <main id="contenido">
        <Routes>
          <Route path={ROUTES.home} element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
