import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Lleva el foco al elemento indicado sin moverlo de sitio.
 *
 * Un encabezado o un `<main>` no son focalizables por defecto: se les pone
 * `tabindex="-1"` (accesible por script, fuera del orden de tabulación). El
 * anillo de foco no aparece porque `src/index.css` sólo lo pinta en
 * `:focus-visible`, que no se activa con un foco programático.
 *
 * `preventScroll` es obligatorio: el desplazamiento ya lo hemos hecho nosotros
 * respetando `prefers-reduced-motion`, y dejar que el foco vuelva a moverlo
 * lo haría de golpe.
 */
function moveFocusTo(element) {
  if (!element) return
  if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '-1')
  element.focus({ preventScroll: true })
}

/**
 * react-router bloquea el desplazamiento nativo a la ancla: su manejador de
 * clic llama a preventDefault(), y el desplazamiento automático solo existe
 * con createBrowserRouter. Lo reponemos a mano.
 *
 * Sin hash, al cambiar de ruta volvemos arriba: si no, quien viene de mitad
 * de la portada aterriza en mitad de la página siguiente.
 *
 * Y movemos el foco: una navegación de SPA no recarga el documento, así que
 * el lector de pantalla no anuncia nada y el foco se queda en el enlace que
 * ya no existe. Al cambiar de ruta lo llevamos al `h1` de la página nueva
 * (o a `#contenido` si no lo hubiera); con ancla, al destino del ancla.
 */
export default function ScrollToHash() {
  const { pathname, hash } = useLocation()
  // La carga inicial ya la anuncia el navegador: robarle el foco ahí sería
  // ruido. Se guarda la última ubicación vista (en vez de un simple «ya he
  // montado») para que el doble efecto de StrictMode en desarrollo tampoco
  // cuente como navegación.
  const seen = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const behavior = reduce ? 'auto' : 'smooth'
    const location = `${pathname}${hash}`
    const navigated = seen.current !== null && seen.current !== location
    seen.current = location

    if (!hash) {
      window.scrollTo({ top: 0, behavior })
      if (navigated) {
        moveFocusTo(document.querySelector('main h1') ?? document.getElementById('contenido'))
      }
      return
    }

    const target = document.getElementById(decodeURIComponent(hash.slice(1)))
    if (target) {
      target.scrollIntoView({ behavior, block: 'start' })
      if (navigated) moveFocusTo(target)
    }
  }, [pathname, hash])

  return null
}
