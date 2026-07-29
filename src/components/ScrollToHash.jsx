import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * react-router bloquea el desplazamiento nativo a la ancla: su manejador de
 * clic llama a preventDefault(), y el desplazamiento automático solo existe
 * con createBrowserRouter. Lo reponemos a mano.
 *
 * Sin hash, al cambiar de ruta volvemos arriba: si no, quien viene de mitad
 * de la portada aterriza en mitad de la página siguiente.
 */
export default function ScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const behavior = reduce ? 'auto' : 'smooth'

    if (!hash) {
      window.scrollTo({ top: 0, behavior })
      return
    }

    const target = document.getElementById(decodeURIComponent(hash.slice(1)))
    if (target) target.scrollIntoView({ behavior, block: 'start' })
  }, [pathname, hash])

  return null
}
