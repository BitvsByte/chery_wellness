import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { NAV_LINKS } from '../data/content.js'
import { ROUTES } from '../data/plans.js'
import { IconMenu, IconClose } from './ui/Icons.jsx'

const SERVICE_PATHS = [ROUTES.training, ROUTES.posing]

/**
 * Destino del CTA principal.
 *
 * En una página de servicio apunta a su propio `#solicitar` — el formulario
 * que ya está debajo, con el plan que el visitante acaba de mirar. Apuntar
 * siempre a `/#contacto` lo expulsaba a la portada y le hacía perder el plan.
 * En la portada, que no tiene `#solicitar`, se mantiene `/#contacto`.
 */
export function ctaTarget(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return SERVICE_PATHS.includes(path) ? `${path}#solicitar` : `${ROUTES.home}#contacto`
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const toggleRef = useRef(null)
  const close = () => setOpen(false)
  const cta = ctaTarget(useLocation().pathname)

  // Sin esto, quien navega con teclado queda atrapado dentro del menú abierto.
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <header className="glass-dark glass-sheen sticky top-0 z-50 border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          to="/"
          onClick={close}
          className="flex min-h-[44px] flex-shrink-0 items-center gap-3"
        >
          <img
            src="/icons/pwa-192.png"
            alt=""
            width="40"
            height="40"
            className="h-10 w-10 rounded-full border border-line object-cover"
          />
          <span
            translate="no"
            className="font-display text-sm font-bold uppercase tracking-[0.18em] text-bright"
          >
            CW Wellness&nbsp;PRO
          </span>
        </Link>

        {/* Los 6 enlaces más el botón "Solicitar consulta" necesitan más de
            1100px; con el corte en `lg` (1024px) el menú desbordaba
            horizontalmente justo al cruzar ese punto de ruptura. `xl`
            (1280px) es el primer punto de ruptura donde entra sin recortar
            ningún enlace. */}
        <nav aria-label="Principal" className="hidden items-center gap-7 xl:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="py-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-[#b6bac1] transition-colors duration-200 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link to={cta} className="btn-chrome ml-2 whitespace-nowrap px-5 text-xs">
            Solicitar consulta
          </Link>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line text-bright xl:hidden"
          aria-expanded={open}
          aria-controls="menu-movil"
          onClick={() => setOpen(!open)}
        >
          <span className="sr-only">{open ? 'Cerrar menú' : 'Abrir menú'}</span>
          {open ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
        </button>
      </div>

      <nav
        id="menu-movil"
        aria-label="Principal móvil"
        className={`${open ? 'block' : 'hidden'} glass-dark border-t xl:hidden`}
      >
        <ul className="mx-auto flex max-w-6xl flex-col px-4 py-3">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                onClick={close}
                className="block min-h-[44px] py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#b6bac1] transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="pb-2 pt-3">
            <Link to={cta} onClick={close} className="btn-chrome w-full">
              Solicitar consulta
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
