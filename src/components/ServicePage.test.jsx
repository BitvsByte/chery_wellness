import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ServicePage from './ServicePage.jsx'
import { TRAINING, POSING } from '../data/plans.js'
import { PLAN_OPTIONS } from '../utils/validation.js'

describe('ServicePage', () => {
  let scrollIntoViewMock

  beforeEach(() => {
    scrollIntoViewMock = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoViewMock
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('usa un único h1 con el nombre del área', () => {
    render(
      <ServicePage area={TRAINING} plans={TRAINING.tiers} faqs={[]} intro={TRAINING.summary} />,
    )
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveTextContent(TRAINING.name)
  })

  it('muestra la introducción del área', () => {
    render(
      <ServicePage area={TRAINING} plans={TRAINING.tiers} faqs={[]} intro={TRAINING.summary} />,
    )
    expect(screen.getByText(TRAINING.summary)).toBeInTheDocument()
  })

  it('no muestra la sección de FAQ cuando la lista está vacía', () => {
    render(
      <ServicePage area={TRAINING} plans={TRAINING.tiers} faqs={[]} intro={TRAINING.summary} />,
    )
    expect(screen.queryByText('Preguntas frecuentes')).not.toBeInTheDocument()
  })

  it('muestra las FAQ recibidas cuando las hay', () => {
    const faqs = [{ q: '¿Pregunta?', a: 'Respuesta.', area: 'training' }]
    render(<ServicePage area={TRAINING} plans={TRAINING.tiers} faqs={faqs} intro="" />)
    expect(screen.getByText('¿Pregunta?')).toBeInTheDocument()
    expect(screen.getByText('Respuesta.')).toBeInTheDocument()
  })

  // Cada botón «Solicitar …» debe rellenar el campo Plan del formulario con
  // una etiqueta que exista de verdad en PLAN_OPTIONS: si no, el desplegable
  // queda en blanco y la validación la rechaza.
  it('cada botón de plan de entrenamiento preselecciona una etiqueta válida del formulario', async () => {
    const user = userEvent.setup()
    render(
      <ServicePage area={TRAINING} plans={TRAINING.tiers} faqs={[]} intro={TRAINING.summary} />,
    )
    for (const tier of TRAINING.tiers) {
      // Cada tarjeta de plan vive en su propio artículo: dos planes pueden
      // compartir la misma duración («1 mes»), así que hay que acotar la
      // búsqueda del botón a la tarjeta de este plan.
      const card = within(document.getElementById(`plan-${tier.id}`))
      for (const price of tier.prices) {
        // eslint-disable-next-line no-await-in-loop
        await user.click(card.getByRole('button', { name: `Solicitar ${price.label}` }))
        const expectedLabel = `${tier.name} · ${price.label}`
        expect(PLAN_OPTIONS).toContain(expectedLabel)
        // eslint-disable-next-line no-await-in-loop
        expect(await screen.findByLabelText(/Plan/i)).toHaveValue(expectedLabel)
      }
    }
  })

  it('cada botón de pack de posing preselecciona una etiqueta válida del formulario', async () => {
    const user = userEvent.setup()
    render(<ServicePage area={POSING} plans={POSING.packs} faqs={[]} intro={POSING.summary} />)
    for (const pack of POSING.packs) {
      const card = within(document.getElementById(`plan-${pack.id}`))
      for (const price of pack.prices) {
        // eslint-disable-next-line no-await-in-loop
        await user.click(card.getByRole('button', { name: `Solicitar ${price.label}` }))
        const expectedLabel = `Posing · ${price.label}`
        expect(PLAN_OPTIONS).toContain(expectedLabel)
        // eslint-disable-next-line no-await-in-loop
        expect(await screen.findByLabelText(/Plan/i)).toHaveValue(expectedLabel)
      }
    }
  })
})
