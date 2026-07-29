import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { PAGES, SITE, NOT_FOUND, ROBOTS_INDEX } from '../data/seo.js'

/**
 * Devuelve el <head> que corresponde a una ruta: título, canónica y robots.
 *
 * Se exporta aparte del componente para poder probarla sin montar el árbol.
 * Los valores salen de `PAGES` (`src/data/seo.js`), los mismos que el
 * prerender incrusta en cada HTML: así una carga completa y una navegación
 * interna no pueden discrepar.
 */
export function headForPath(pathname) {
  // `/posing/` y `/posing` son la misma página para react-router; que también
  // lo sean aquí.
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  const page = Object.values(PAGES).find((candidate) => candidate.path === path)

  if (!page) {
    return { title: NOT_FOUND.title, canonical: null, robots: NOT_FOUND.robots }
  }
  return { title: page.title, canonical: `${SITE.url}${page.path}`, robots: ROBOTS_INDEX }
}

/**
 * Mantiene `<title>`, `<link rel="canonical">` y `<meta name="robots">` al día
 * en las navegaciones internas.
 *
 * Sin esto sólo las cargas completas recibían el <head> correcto: al pulsar
 * «Posing» en el menú cambiaban la URL y el `h1`, pero la pestaña, el
 * marcador, el historial y la analítica seguían diciendo «portada» el resto
 * de la sesión.
 *
 * Todo ocurre dentro de un efecto porque las tres rutas se prerenderizan en
 * Node, donde no hay `document`.
 */
export default function DocumentHead() {
  const { pathname } = useLocation()

  useEffect(() => {
    const { title, canonical, robots } = headForPath(pathname)
    document.title = title

    const link = document.querySelector('link[rel="canonical"]')
    if (link) {
      // Una URL desconocida no tiene canónica propia; dejar la de la portada
      // sería declarar que ESA es la página buena. Se retira y se repone al
      // volver a una ruta real.
      if (canonical) link.setAttribute('href', canonical)
      else link.removeAttribute('href')
    }

    const meta = document.querySelector('meta[name="robots"]')
    if (meta) meta.setAttribute('content', robots)
  }, [pathname])

  return null
}
