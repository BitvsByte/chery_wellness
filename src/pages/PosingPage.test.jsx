import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PosingPage from './PosingPage.jsx'
import { POSING } from '../data/plans.js'
import { FAQS_POSING } from '../data/content.js'

describe('PosingPage', () => {
  it('muestra el h1 y los dos packs de posing', () => {
    render(<PosingPage />)
    expect(screen.getByRole('heading', { level: 1, name: POSING.name })).toBeInTheDocument()
    POSING.packs.forEach((pack) => {
      expect(screen.getByRole('heading', { level: 3, name: pack.name })).toBeInTheDocument()
    })
  })

  it('muestra solo las FAQ de posing', () => {
    render(<PosingPage />)
    FAQS_POSING.forEach((faq) => {
      expect(screen.getByText(faq.q)).toBeInTheDocument()
    })
  })
})
