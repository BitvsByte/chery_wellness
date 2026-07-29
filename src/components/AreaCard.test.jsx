import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AreaCard from './AreaCard.jsx'
import { TRAINING } from '../data/plans.js'

const renderCard = () =>
  render(
    <MemoryRouter>
      <AreaCard
        area={TRAINING}
        to="/entrenamiento-y-dietas"
        unit="mes"
        img="/uploads/chery_4.jpeg"
        imgAlt="Chery Figueroa en condición de competición"
      />
    </MemoryRouter>,
  )

describe('AreaCard', () => {
  it('muestra el precio de entrada del área', () => {
    renderCard()
    // El normalizador por defecto de Testing Library colapsa el espacio
    // duro que pone formatEuro a un espacio normal antes de comparar, así
    // que aquí se busca con espacio normal.
    expect(screen.getByText(/100 €/)).toBeInTheDocument()
    expect(screen.getByText(/mes/)).toBeInTheDocument()
  })

  it('enlaza al área con un enlace real, no un botón', () => {
    renderCard()
    const link = screen.getByRole('link', { name: /Entrenamiento y Dietas/i })
    expect(link).toHaveAttribute('href', '/entrenamiento-y-dietas')
  })

  it('describe la imagen', () => {
    renderCard()
    expect(screen.getByAltText(/Chery Figueroa/)).toBeInTheDocument()
  })
})
