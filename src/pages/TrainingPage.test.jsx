import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TrainingPage from './TrainingPage.jsx'
import { TRAINING } from '../data/plans.js'
import { FAQS_TRAINING } from '../data/content.js'

describe('TrainingPage', () => {
  it('muestra el h1 y los dos planes de entrenamiento', () => {
    render(<TrainingPage />)
    expect(screen.getByRole('heading', { level: 1, name: TRAINING.name })).toBeInTheDocument()
    TRAINING.tiers.forEach((tier) => {
      expect(screen.getByRole('heading', { level: 3, name: tier.name })).toBeInTheDocument()
    })
  })

  it('muestra solo las FAQ de entrenamiento', () => {
    render(<TrainingPage />)
    FAQS_TRAINING.forEach((faq) => {
      expect(screen.getByText(faq.q)).toBeInTheDocument()
    })
  })
})
