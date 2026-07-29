import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
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
})
