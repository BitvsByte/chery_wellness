import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactForm from './ContactForm.jsx'

describe('ContactForm', () => {
  it('ofrece un campo de plan con todas las tarifas', () => {
    render(<ContactForm />)
    const select = screen.getByLabelText(/Plan/i)
    expect(select).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Competición · 3 meses' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Posing · 4 clases' })).toBeInTheDocument()
  })

  it('preselecciona el plan recibido', () => {
    render(<ContactForm presetPlan="Start · 3 meses" />)
    expect(screen.getByLabelText(/Plan/i)).toHaveValue('Start · 3 meses')
  })

  // El padre (`ServicePage`) ya no remonta el formulario al cambiar de plan,
  // así que es `ContactForm` quien debe sincronizar el campo — y sólo ese.
  it('actualiza el plan cuando cambia presetPlan, sin tocar el resto', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<ContactForm presetPlan="Start · 1 mes" />)

    await user.type(screen.getByLabelText(/^Nombre/i), 'Chery')
    await user.type(screen.getByLabelText(/Mensaje/i), 'Vengo de una lesión de hombro')

    rerender(<ContactForm presetPlan="Competición · 6 meses" />)

    expect(screen.getByLabelText(/Plan/i)).toHaveValue('Competición · 6 meses')
    expect(screen.getByLabelText(/^Nombre/i)).toHaveValue('Chery')
    expect(screen.getByLabelText(/Mensaje/i)).toHaveValue('Vengo de una lesión de hombro')
  })

  it('no pisa el plan elegido a mano si presetPlan no ha cambiado', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<ContactForm presetPlan="Start · 1 mes" />)

    await user.selectOptions(screen.getByLabelText(/Plan/i), 'Posing · 4 clases')
    rerender(<ContactForm presetPlan="Start · 1 mes" />)

    expect(screen.getByLabelText(/Plan/i)).toHaveValue('Posing · 4 clases')
  })

  // Un import sin usar no tiene comportamiento observable, así que se
  // comprueba sobre el propio fichero: `CONTACT` se importaba y nunca se
  // llegaba a leer.
  it('sólo importa de content.js lo que usa', () => {
    const source = readFileSync(resolve('src/components/ContactForm.jsx'), 'utf8')
    const named = source.match(/import\s*\{([^}]*)\}\s*from\s*'\.\.\/data\/content\.js'/)[1]
    for (const symbol of named.split(',').map((s) => s.trim()).filter(Boolean)) {
      const uses = source.match(new RegExp(`\\b${symbol}\\b`, 'g')) ?? []
      expect(uses.length, `${symbol} se importa pero no se usa`).toBeGreaterThan(1)
    }
  })
})
