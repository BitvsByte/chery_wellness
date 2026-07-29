import { describe, it, expect } from 'vitest'
import { ROUTES, TRAINING, POSING, withSavings, cheapest } from './plans.js'

describe('withSavings', () => {
  it('calcula el ahorro tomando el primer precio como unidad', () => {
    const out = withSavings([
      { units: 1, label: '1 mes', amount: 100 },
      { units: 3, label: '3 meses', amount: 250 },
    ])
    expect(out[0].savings).toBe(0)
    expect(out[1].savings).toBe(50) // 100 × 3 − 250
  })

  it('acepta un precio unitario explícito que no se muestra', () => {
    // El bono de posing no lista la clase suelta, pero su ahorro se mide
    // contra ella.
    const out = withSavings([{ units: 4, label: '4 clases', amount: 200 }], 60)
    expect(out).toHaveLength(1)
    expect(out[0].savings).toBe(40) // 60 × 4 − 200
  })
})

describe('TRAINING', () => {
  it('tiene los precios acordados con Chery', () => {
    const start = TRAINING.tiers.find((t) => t.id === 'start')
    const comp = TRAINING.tiers.find((t) => t.id === 'competicion')
    expect(start.prices.map((p) => [p.units, p.amount])).toEqual([[1, 100], [3, 250]])
    expect(comp.prices.map((p) => [p.units, p.amount])).toEqual([[1, 150], [3, 350], [6, 600]])
  })

  it('calcula los ahorros del plan de competición', () => {
    const comp = TRAINING.tiers.find((t) => t.id === 'competicion')
    expect(comp.prices.map((p) => p.savings)).toEqual([0, 100, 300])
  })

  it('destaca competición y solo competición', () => {
    expect(TRAINING.tiers.filter((t) => t.highlight).map((t) => t.id)).toEqual(['competicion'])
  })
})

describe('POSING', () => {
  it('cobra por clase y no por mes, con 45 min en ambas modalidades', () => {
    expect(POSING.packs.map((p) => [p.prices[0].units, p.prices[0].amount])).toEqual([[1, 60], [4, 200]])
    // Cada modalidad muestra una sola fila de precio.
    POSING.packs.forEach((pack) => expect(pack.prices).toHaveLength(1))
    POSING.packs.forEach((pack) => {
      expect(pack.features.some((f) => f.includes('45'))).toBe(true)
    })
  })

  it('el bono de 4 ahorra 40 €', () => {
    const bono = POSING.packs.find((p) => p.id === 'bono-4')
    expect(bono.prices[0].savings).toBe(40) // 60 × 4 − 200
  })
})

describe('cheapest', () => {
  it('devuelve el importe de entrada de cada área', () => {
    expect(cheapest(TRAINING)).toBe(100)
    expect(cheapest(POSING)).toBe(60)
  })
})

describe('ROUTES', () => {
  it('define las tres rutas del sitio', () => {
    expect(ROUTES).toEqual({
      home: '/',
      training: '/entrenamiento-y-dietas',
      posing: '/posing',
    })
  })
})
