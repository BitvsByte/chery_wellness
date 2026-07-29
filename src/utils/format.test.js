import { describe, it, expect } from 'vitest'
import { formatEuro } from './format.js'

describe('formatEuro', () => {
  it('formatea enteros sin decimales', () => {
    expect(formatEuro(100)).toBe('100 €')
    expect(formatEuro(600)).toBe('600 €')
  })

  it('usa siempre espacio duro, nunca espacio fino', () => {
    // U+202F rompería la hidratación: Node y el navegador pueden diferir.
    expect(formatEuro(250)).not.toContain(' ')
    expect(formatEuro(250)).toContain(' ')
  })

  it('agrupa millares al estilo español', () => {
    // CLDR es-ES exige minimumGroupingDigits: 2 con useGrouping "auto" (el
    // valor por defecto de Intl.NumberFormat): el separador de millar solo
    // aparece cuando el primer grupo tendría 2+ dígitos, es decir a partir
    // de 5 cifras. 1200 son 4 cifras y no se agrupa; 12000 sí se agrupa.
    expect(formatEuro(1200)).toBe('1200 €')
    expect(formatEuro(12000)).toBe('12.000 €')
  })
})
