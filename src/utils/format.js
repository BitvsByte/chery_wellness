// Formato de importes compartido por servidor y cliente.
//
// `Intl.NumberFormat` puede separar la cifra del símbolo con espacio duro
// (U+00A0) o con espacio fino (U+202F) según la versión de ICU. Si Node y el
// navegador eligen distinto, React detecta texto diferente al hidratar y
// repinta con un aviso en consola. Normalizamos a espacio duro siempre.

const EUR = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatEuro(amount) {
  return EUR.format(amount).replace(/ /g, ' ')
}
