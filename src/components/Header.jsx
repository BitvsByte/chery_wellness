import { useState } from 'react'
import { NAV_LINKS } from '../data/content.js'
import { IconMenu, IconClose } from './ui/Icons.jsx'

export default function Header() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header className="glass-dark glass-sheen sticky top-0 z-50 border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a
          href="#inicio"
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
          <span className="font-display text-sm font-bold uppercase tracking-[0.18em] text-bright">
            CW Wellness&nbsp;PRO
          </span>
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="py-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-[#b6bac1] transition-colors duration-200 hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <a href="#contacto" className="btn-chrome ml-2 whitespace-nowrap px-5 text-xs">
            Solicitar consulta
          </a>
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line text-bright lg:hidden"
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
        className={`${open ? 'block' : 'hidden'} glass-dark border-t lg:hidden`}
      >
        <ul className="mx-auto flex max-w-6xl flex-col px-4 py-3">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={close}
                className="block min-h-[44px] py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#b6bac1] transition-colors hover:text-white"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="pb-2 pt-3">
            <a href="#contacto" onClick={close} className="btn-chrome w-full">
              Solicitar consulta
            </a>
          </li>
        </ul>
      </nav>
    </header>
  )
}
