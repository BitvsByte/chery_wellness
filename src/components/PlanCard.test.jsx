import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PlanCard from './PlanCard.jsx'

const PLAN = {
  id: 'competicion',
  name: 'Competición',
  tag: 'Rumbo a la tarima',
  highlight: true,
  summary: 'Para quien quiere competir.',
  prices: [
    { units: 1, label: '1 mes', amount: 150, savings: 0 },
    { units: 3, label: '3 meses', amount: 350, savings: 100 },
  ],
  features: ['Seguimiento diario'],
}

describe('PlanCard', () => {
  it('muestra el nombre como encabezado de nivel 3', () => {
    render(<PlanCard plan={PLAN} onSelect={() => {}} />)
    expect(screen.getByRole('heading', { level: 3, name: /Competición/ })).toBeInTheDocument()
  })

  it('marca la escalera de precios como lista de definiciones', () => {
    const { container } = render(<PlanCard plan={PLAN} onSelect={() => {}} />)
    expect(container.querySelectorAll('dl')).toHaveLength(1)
    expect(container.querySelectorAll('dt')).toHaveLength(2)
    expect(container.querySelectorAll('dd')).toHaveLength(2)
  })

  it('muestra los importes con espacio duro y cifras tabulares', () => {
    const { container } = render(<PlanCard plan={PLAN} onSelect={() => {}} />)
    const dd = container.querySelectorAll('dd')[1]
    expect(dd.textContent).toContain('350 €')
    expect(dd.className).toContain('nums')
  })

  it('anuncia el ahorro solo cuando lo hay', () => {
    render(<PlanCard plan={PLAN} onSelect={() => {}} />)
    expect(screen.getByText(/ahorras 100/i)).toBeInTheDocument()
    expect(screen.queryByText(/ahorras 0/i)).not.toBeInTheDocument()
  })

  it('indica que el IVA está incluido', () => {
    render(<PlanCard plan={PLAN} onSelect={() => {}} />)
    expect(screen.getByText(/IVA incluido/i)).toBeInTheDocument()
  })

  it('avisa con el plan y la duración elegidos', async () => {
    const onSelect = vi.fn()
    render(<PlanCard plan={PLAN} onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button', { name: /3 meses/ }))
    expect(onSelect).toHaveBeenCalledWith('competicion', '3 meses')
  })
})
