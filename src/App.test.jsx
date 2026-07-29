import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App.jsx'
import { ROUTES } from './data/plans.js'
import { TRAINING, POSING } from './data/plans.js'

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
