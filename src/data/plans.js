// Tarifas de Chery. Fuente única: de aquí salen las tarjetas de precio, las
// opciones del formulario y el JSON-LD. Editar un importe aquí lo cambia en
// los tres sitios a la vez.
//
// Todos los importes son finales, con IVA incluido.

export const ROUTES = {
  home: '/',
  training: '/entrenamiento-y-dietas',
  posing: '/posing',
}

/**
 * Anota cada precio con lo que ahorra frente a comprar la unidad suelta.
 *
 * Por defecto toma como unidad el primer precio de la lista. `unitAmount`
 * permite medir el ahorro contra un precio que no se muestra, como el bono de
 * posing, que se compara con la clase suelta sin listarla.
 */
export function withSavings(prices, unitAmount = prices[0].amount) {
  return prices.map((price) => ({
    ...price,
    savings: unitAmount * price.units - price.amount,
  }))
}

export const TRAINING = {
  slug: ROUTES.training,
  name: 'Entrenamiento y Dietas',
  tag: 'Dieta · Entreno · Seguimiento',
  summary:
    'Planes de nutrición y entrenamiento con seguimiento, desde tu primera fase de mejora hasta la puesta a punto.',
  tiers: [
    {
      id: 'start',
      name: 'Start',
      tag: 'Empieza con método',
      highlight: false,
      summary:
        'Para construir base con un plan hecho a tu medida y revisiones periódicas.',
      prices: withSavings([
        { units: 1, label: '1 mes', amount: 100 },
        { units: 3, label: '3 meses', amount: 250 },
      ]),
      features: [
        'Dieta personalizada',
        'Plan de entrenamiento',
        'Seguimiento',
        'Revisión cada 30 días',
      ],
    },
    {
      id: 'competicion',
      name: 'Competición',
      tag: 'Rumbo a la tarima',
      highlight: true,
      summary:
        'Para quien está a punto de competir o quiere hacerlo, con acompañamiento diario.',
      prices: withSavings([
        { units: 1, label: '1 mes', amount: 150 },
        { units: 3, label: '3 meses', amount: 350 },
        { units: 6, label: '6 meses', amount: 600 },
      ]),
      features: [
        'Todo lo incluido en Start',
        'Entrenamiento y dieta enfocados a objetivos',
        'Seguimiento diario',
        'Análisis de fotos y de entrenos',
        'Entrenos específicos orientados a competir',
        'Acceso a canal premium',
      ],
    },
  ],
}

export const POSING = {
  slug: ROUTES.posing,
  name: 'Posing',
  tag: 'Clases · Sala privada',
  summary:
    'Técnica de pose, transiciones y poses reglamentarias Wellness, corregidas una a una en sala privada.',
  packs: [
    {
      id: 'clase-1',
      name: 'Clase suelta',
      tag: 'Prueba el método',
      highlight: false,
      summary: 'Una sesión para corregir lo que más te penaliza sobre la tarima.',
      prices: withSavings([{ units: 1, label: '1 clase', amount: 60 }]),
      features: ['45 min en sala privada', 'Correcciones durante la clase'],
    },
    {
      id: 'bono-4',
      name: 'Bono de 4 clases',
      tag: 'Corrige de raíz',
      highlight: true,
      summary:
        'Cuatro sesiones para trabajar los errores hasta que dejen de aparecer.',
      // Solo se lista la fila de 4 clases; el ahorro se mide contra los 60 €
      // de la clase suelta, que no se muestra aquí.
      prices: withSavings([{ units: 4, label: '4 clases', amount: 200 }], 60),
      features: [
        '45 min en sala privada por clase',
        'Corrección de errores',
        'Seguimiento continuado sobre los fallos detectados',
      ],
    },
  ],
}

/**
 * Etiqueta con la que el cliente ve un precio concreto.
 *
 * Fuente única de ese nombre: la usan las opciones del formulario
 * (`PLAN_OPTIONS`), la preselección al pulsar «Solicitar …», el mensaje que
 * se envía por WhatsApp o email y el `name` de cada `Offer` del JSON-LD. Si
 * cada sitio la construyera por su cuenta, el cliente podría pedir «Posing ·
 * 4 clases» y el buscador anunciar «Bono de 4 clases · 4 clases».
 *
 * En posing manda el nombre del área («Posing · 1 clase»): los packs se
 * llaman «Clase suelta» y «Bono de 4 clases», nombres que ya repiten la
 * duración. En entrenamiento manda el nombre del plan («Start · 3 meses»),
 * que es lo que distingue una tarifa de otra.
 */
export function priceLabel(area, group, price) {
  return `${area.packs ? area.name : group.name} · ${price.label}`
}

/** Importe de entrada de un área, para el «desde» de la home. */
export function cheapest(area) {
  const groups = area.tiers ?? area.packs
  return Math.min(...groups.flatMap((g) => g.prices.map((p) => p.amount)))
}
