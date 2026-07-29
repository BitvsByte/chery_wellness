import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from './App.jsx'
import { ROUTES } from './data/plans.js'
import { TRAINING, POSING } from './data/plans.js'
import { PAGES, NOT_FOUND, ROBOTS_INDEX } from './data/seo.js'

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )

describe('App: rutas de servicio', () => {
  let originalMatchMedia
  let scrollToSpy

  beforeEach(() => {
    originalMatchMedia = window.matchMedia
    window.matchMedia = vi.fn().mockReturnValue({ matches: false })
    // jsdom no implementa window.scrollTo; ScrollToHash lo llama al montar.
    scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
    scrollToSpy.mockRestore()
  })

  it('sirve la página de Entrenamiento en su ruta, con un único h1', () => {
    renderAt(ROUTES.training)
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveTextContent(TRAINING.name)
  })

  it('sirve la página de Posing en su ruta, con un único h1', () => {
    renderAt(ROUTES.posing)
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveTextContent(POSING.name)
  })
})

// I4: sin ruta comodín, `/precios` devolvía 200 con `#contenido` vacío y el
// <head> de la portada: una página en blanco y un soft-404 indexable.
describe('App: URL desconocida', () => {
  let originalMatchMedia
  let scrollToSpy

  beforeEach(() => {
    originalMatchMedia = window.matchMedia
    window.matchMedia = vi.fn().mockReturnValue({ matches: false })
    scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
    scrollToSpy.mockRestore()
  })

  it('muestra un aviso con su propio h1 en vez de dejar el contenido vacío', () => {
    renderAt('/precios')
    const main = document.getElementById('contenido')
    expect(main).not.toBeEmptyDOMElement()
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveTextContent('Página no encontrada')
  })

  it('ofrece las tres rutas reales', () => {
    renderAt('/precios')
    const main = document.getElementById('contenido')
    const destinos = [...main.querySelectorAll('a')].map((a) => a.getAttribute('href'))
    expect(destinos).toEqual(Object.values(ROUTES))
  })

  it('se marca noindex y retira la canónica de la portada', () => {
    document.head.innerHTML =
      '<link rel="canonical" href="https://cherywellnesspro.com/">' +
      `<meta name="robots" content="${ROBOTS_INDEX}">`

    renderAt('/precios')

    expect(document.querySelector('meta[name="robots"]').getAttribute('content')).toBe(
      NOT_FOUND.robots,
    )
    expect(document.querySelector('meta[name="robots"]').getAttribute('content')).toContain(
      'noindex',
    )
    expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBeNull()
    document.head.innerHTML = ''
  })
})

// I5: hasta ahora solo las cargas completas recibían el <head> correcto. Al
// navegar por dentro cambiaban la URL y el h1, pero el título y la canónica
// seguían siendo los de la portada toda la sesión.
describe('App: <head> al navegar por dentro', () => {
  let originalMatchMedia
  let scrollToSpy

  beforeEach(() => {
    originalMatchMedia = window.matchMedia
    window.matchMedia = vi.fn().mockReturnValue({ matches: false })
    scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    document.head.innerHTML =
      '<link rel="canonical" href="https://cherywellnesspro.com/">' +
      `<meta name="robots" content="${ROBOTS_INDEX}">`
    document.title = PAGES.home.title
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
    scrollToSpy.mockRestore()
    document.head.innerHTML = ''
  })

  const canonical = () => document.querySelector('link[rel="canonical"]').getAttribute('href')

  it('pone el título y la canónica de Posing al pulsar «Posing» desde la portada', async () => {
    const user = userEvent.setup()
    renderAt(ROUTES.home)
    expect(document.title).toBe(PAGES.home.title)

    await user.click(screen.getAllByRole('link', { name: 'Posing' })[0])

    expect(document.title).toBe(PAGES.posing.title)
    expect(canonical()).toBe(`https://cherywellnesspro.com${ROUTES.posing}`)
  })

  it('repone el <head> indexable al volver a la portada desde un 404', async () => {
    const user = userEvent.setup()
    renderAt('/precios')
    expect(document.title).toBe(NOT_FOUND.title)

    await user.click(screen.getAllByRole('link', { name: 'Portada' })[0])

    expect(document.title).toBe(PAGES.home.title)
    expect(canonical()).toBe('https://cherywellnesspro.com/')
    expect(document.querySelector('meta[name="robots"]').getAttribute('content')).toBe(
      ROBOTS_INDEX,
    )
  })
})

// Minoritario: una navegación de SPA no recarga el documento, así que sin
// mover el foco el lector de pantalla no anuncia nada y el foco se queda en
// un enlace que ya no está en la página.
describe('App: foco al cambiar de ruta', () => {
  let originalMatchMedia
  let scrollToSpy
  let originalScrollIntoView

  beforeEach(() => {
    originalMatchMedia = window.matchMedia
    window.matchMedia = vi.fn().mockReturnValue({ matches: false })
    scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    originalScrollIntoView = Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
    scrollToSpy.mockRestore()
    Element.prototype.scrollIntoView = originalScrollIntoView
  })

  it('lleva el foco al h1 de la página nueva', async () => {
    const user = userEvent.setup()
    renderAt(ROUTES.home)

    await user.click(screen.getAllByRole('link', { name: 'Posing' })[0])

    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent(POSING.name)
    expect(h1).toHaveFocus()
  })

  it('no roba el foco en la carga inicial', () => {
    renderAt(ROUTES.posing)
    expect(document.body).toHaveFocus()
  })
})
