import { Link } from 'react-router-dom'
import ChromeHeading from '../components/ui/ChromeHeading.jsx'
import { ROUTES } from '../data/plans.js'

const DESTINOS = [
  { to: ROUTES.home, label: 'Portada' },
  { to: ROUTES.training, label: 'Entrenamiento y Dietas' },
  { to: ROUTES.posing, label: 'Posing' },
]

/**
 * Pantalla de URL desconocida.
 *
 * Antes de las rutas nuevas, cualquier URL renderizaba la portada; después,
 * una errata o un enlace antiguo dejaban `#contenido` vacío y el servidor
 * devolvía un 200 con el título y la canónica de la portada: un soft-404
 * indexable. Aquí se dice lo que pasa y se ofrecen las tres rutas reales.
 *
 * El `<meta name="robots" content="noindex">` lo pone `DocumentHead`, que es
 * quien gestiona el <head> por ruta: esta página no se prerenderiza, así que
 * sólo puede marcarse desde el cliente.
 */
export default function NotFoundPage() {
  return (
    <section aria-labelledby="titulo-404" className="scroll-mt-24">
      <div className="safe-x mx-auto max-w-6xl px-4 pb-6 pt-10 sm:px-6">
        <div className="panel p-6 sm:p-11">
          <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-steel">
            Error 404
          </p>
          <ChromeHeading as="h1" id="titulo-404" className="mb-4 mt-2 text-4xl sm:text-5xl">
            Página no encontrada
          </ChromeHeading>
          <p className="mx-auto mb-9 max-w-lg text-center text-[15px] leading-relaxed text-body [text-wrap:pretty]">
            Esta dirección no existe en la web. Puede que el enlace sea antiguo o que haya una
            errata. Estas son las páginas disponibles:
          </p>
          <ul className="mx-auto flex max-w-md flex-col gap-3">
            {DESTINOS.map((destino) => (
              <li key={destino.to}>
                <Link to={destino.to} className="btn-ghost w-full">
                  {destino.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
