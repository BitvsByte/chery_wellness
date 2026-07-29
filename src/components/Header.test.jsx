import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Header from './Header.jsx'

const renderHeader = () =>
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  )

describe('Header', () => {
  it('enlaza las dos áreas de servicio', () => {
    renderHeader()
    expect(screen.getAllByRole('link', { name: 'Entrenamiento' })[0]).toHaveAttribute(
      'href',
      '/entrenamiento-y-dietas',
    )
    expect(screen.getAllByRole('link', { name: 'Posing' })[0]).toHaveAttribute('href', '/posing')
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
