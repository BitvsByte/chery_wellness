import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Header from './Header.jsx'
import { ROUTES } from '../data/plans.js'

const renderHeader = (path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Header />
    </MemoryRouter>,
  )

const ctaLinks = () => screen.getAllByRole('link', { name: 'Solicitar consulta' })

describe('Header', () => {
  it('enlaza las dos áreas de servicio', () => {
    renderHeader()
    expect(screen.getAllByRole('link', { name: 'Entrenamiento' })[0]).toHaveAttribute(
      'href',
      '/entrenamiento-y-dietas',
    )
    expect(screen.getAllByRole('link', { name: 'Posing' })[0]).toHaveAttribute('href', '/posing')
  })

  // El CTA apuntaba siempre a `/#contacto`: desde una página de servicio
  // expulsaba al visitante a la portada y le hacía perder el plan que
  // acababa de mirar, teniendo esa misma página su propio `#solicitar`.
  it('en una página de servicio apunta al formulario de esa misma página', () => {
    for (const path of [ROUTES.training, ROUTES.posing]) {
      const { unmount } = renderHeader(path)
      for (const cta of ctaLinks()) {
        expect(cta).toHaveAttribute('href', `${path}#solicitar`)
      }
      unmount()
    }
  })

  it('trata la forma con barra final como la misma página', () => {
    renderHeader(`${ROUTES.posing}/`)
    for (const cta of ctaLinks()) {
      expect(cta).toHaveAttribute('href', `${ROUTES.posing}#solicitar`)
    }
  })

  it('en la portada sigue llevando a #contacto', () => {
    renderHeader(ROUTES.home)
    for (const cta of ctaLinks()) {
      expect(cta).toHaveAttribute('href', '/#contacto')
    }
  })

  it('cierra el menú móvil con Escape y devuelve el foco al botón', async () => {
    renderHeader()
    const toggle = screen.getByRole('button', { name: /Abrir menú/ })
    await userEvent.click(toggle)
    expect(screen.getByRole('button', { name: /Cerrar menú/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await userEvent.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: /Abrir menú/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.getByRole('button', { name: /Abrir menú/ })).toHaveFocus()
  })
})
