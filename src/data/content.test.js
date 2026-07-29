import { describe, it, expect } from 'vitest'
import { FAQS, FAQS_TRAINING, FAQS_POSING } from './content.js'

describe('reparto de FAQS por área', () => {
  it('cada pregunta pertenece a una sola área, sin solapamiento', () => {
    const training = new Set(FAQS_TRAINING.map((f) => f.q))
    const posing = new Set(FAQS_POSING.map((f) => f.q))
    const overlap = [...training].filter((q) => posing.has(q))
    expect(overlap).toEqual([])
  })

  it('entre ambas listas suman las cinco preguntas de FAQS, sin perder ninguna', () => {
    expect(FAQS_TRAINING.length + FAQS_POSING.length).toBe(FAQS.length)
    const union = new Set([...FAQS_TRAINING, ...FAQS_POSING].map((f) => f.q))
    expect(union.size).toBe(FAQS.length)
  })

  it('no inventa preguntas: todo lo repartido viene de FAQS', () => {
    const allQuestions = new Set(FAQS.map((f) => f.q))
    ;[...FAQS_TRAINING, ...FAQS_POSING].forEach((f) => {
      expect(allQuestions.has(f.q)).toBe(true)
    })
  })

  it('asigna cada pregunta al área acordada', () => {
    const expected = {
      '¿Necesito experiencia para empezar?': 'training',
      '¿El coaching es online o presencial?': 'posing',
      '¿Cuánto dura una preparación completa?': 'training',
      '¿Qué incluye el seguimiento?': 'training',
      '¿Y si no quiero competir?': 'training',
    }
    FAQS.forEach((faq) => {
      expect(faq.area).toBe(expected[faq.q])
    })
  })
})
