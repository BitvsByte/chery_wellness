# Áreas de servicio y tarifas — plan de implementación

> **Para agentes:** SUB-SKILL OBLIGATORIA: usa `superpowers:subagent-driven-development` (recomendado) o `superpowers:executing-plans` para ejecutar este plan tarea a tarea. Los pasos usan casillas (`- [ ]`) para seguimiento.

**Goal:** Publicar dos páginas de servicio con URL propia — Entrenamiento y Dietas, y Posing — cada una con sus tarifas, verificadas automáticamente en accesibilidad y en todos los anchos de pantalla.

**Architecture:** Se añade `react-router-dom` sobre el `App` actual y el prerender pasa de una ruta a tres, generando un HTML completo por página. Los precios viven como datos en `src/data/plans.js` y de ahí salen a la vez las tarjetas, el desplegable del formulario y el JSON-LD, de modo que no puedan contradecirse. La verificación se automatiza con Playwright y axe-core.

**Tech Stack:** React 18, Vite 6, Tailwind 3, react-router-dom 6, vite-plugin-pwa, Vitest, Playwright, axe-core.

Spec: `docs/superpowers/specs/2026-07-29-areas-servicio-precios-design.md`

## Global Constraints

- **No se introduce ningún color, tipografía ni efecto nuevo.** Solo tokens existentes: `ink #111213`, `panel`, `line`, `steel #9ca3af`, `silver #c3c7cd`, `bright #e5e7eb`, `body #aeb3ba`, `dim #8b9099`, y las clases `.card`, `.panel`, `.btn-chrome`, `.btn-ghost`, `.text-chrome`, `.glass-chip`, `.metal-rim`.
- **Tipografías:** solo Playfair Display (`font-display`) y Plus Jakarta Sans (`font-sans`), ya autoalojadas.
- **Idioma:** todo el texto de interfaz, comentarios y mensajes de commit en español.
- **Precios exactos, con IVA incluido:** Start 1 mes 100 €, 3 meses 250 €. Competición 1 mes 150 €, 3 meses 350 €, 6 meses 600 €. Posing 1 clase 60 €, 4 clases 200 €. Todas las clases de posing duran 45 min.
- **Contacto real:** `+34 677 00 67 45`, `@chery_ifbbpro`. No reintroducir los valores de marcador de posición.
- **Accesibilidad:** contraste mínimo 4.5:1; texto de cuerpo nuevo a 15–16 px en móvil; un solo `<h1>` por ruta. Destinos táctiles: **44×44 px en botones y CTA** (`<button>`, `.btn-chrome`, `.btn-ghost`), **24×24 px en enlaces de navegación**. Los enlaces de cabecera y pie no se agrandan: cumplen el criterio AA y conservar el diseño es requisito del encargo.
- **No se inventan hechos.** Ninguna afirmación nueva sobre el método, resultados o credenciales de Chery más allá de lo que ya consta en `content.js`.
- **Orden del build inalterable:** `build:ssr` antes de `vite build`; el prerender ocurre antes de que vite-plugin-pwa calcule el precache.

---

### Task 1: Herramientas de prueba y formato de moneda

Formatear importes con `Intl` es la causa de desajuste de hidratación identificada en el spec: ICU puede emitir espacio duro (`U+00A0`) o espacio fino (`U+202F`) según versión y plataforma. El ayudante normaliza la salida para que servidor y cliente produzcan siempre la misma cadena.

**Files:**
- Create: `src/utils/format.js`
- Create: `src/utils/format.test.js`
- Create: `vitest.config.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: nada.
- Produces: `formatEuro(amount: number): string` — devuelve p. ej. `"100\u00A0€"`. Siempre espacio duro `U+00A0`, nunca `U+202F`, y sin decimales.

- [ ] **Step 1: Instalar Vitest**

```bash
npm install -D vitest@^2.1.8
```

- [ ] **Step 2: Crear la configuración de Vitest**

Crear `vitest.config.js`:

```js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
```

- [ ] **Step 3: Añadir el script de test**

En `package.json`, dentro de `"scripts"`, añadir:

```json
"test": "vitest run"
```

- [ ] **Step 4: Escribir el test que falla**

Crear `src/utils/format.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { formatEuro } from './format.js'

describe('formatEuro', () => {
  it('formatea enteros sin decimales', () => {
    expect(formatEuro(100)).toBe('100\u00A0€')
    expect(formatEuro(600)).toBe('600\u00A0€')
  })

  it('usa siempre espacio duro, nunca espacio fino', () => {
    // U+202F rompería la hidratación: Node y el navegador pueden diferir.
    expect(formatEuro(250)).not.toContain('\u202F')
    expect(formatEuro(250)).not.toContain(' ')
  })

  it('agrupa millares al estilo español', () => {
    expect(formatEuro(1200)).toBe('1200\u00A0€'.replace('1200', '1.200'))
  })
})
```

- [ ] **Step 5: Ejecutar el test y comprobar que falla**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./format.js"`

- [ ] **Step 6: Implementar el ayudante**

Crear `src/utils/format.js`:

```js
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
  return EUR.format(amount).replace(/\u202F/g, '\u00A0')
}
```

- [ ] **Step 7: Ejecutar el test y comprobar que pasa**

Run: `npm test`
Expected: PASS — 3 tests

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vitest.config.js src/utils/format.js src/utils/format.test.js
git commit -m "Formato de moneda determinista para evitar desajuste de hidratación"
```

---

### Task 2: Modelo de datos de planes

**Files:**
- Create: `src/data/plans.js`
- Create: `src/data/plans.test.js`

**Interfaces:**
- Consumes: `formatEuro` de Task 1 (no directamente; solo los componentes lo usan).
- Produces:
  - `ROUTES: { home: '/', training: '/entrenamiento-y-dietas', posing: '/posing' }`
  - `TRAINING: { slug, name, tiers: Tier[] }` donde `Tier = { id, name, tag, highlight: boolean, summary, prices: Price[], features: string[] }`
  - `POSING: { slug, name, packs: Pack[] }` donde `Pack = { id, name, tag, highlight, summary, prices: Price[], features: string[] }`
  - `Price = { units: number, label: string, amount: number, savings: number }`
  - `withSavings(prices: {units,label,amount}[]): Price[]`
  - `cheapest(plan): number` — importe mínimo del plan, para el «desde» de la home.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/data/plans.test.js`:

```js
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
```

- [ ] **Step 2: Ejecutar el test y comprobar que falla**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./plans.js"`

- [ ] **Step 3: Implementar el modelo**

Crear `src/data/plans.js`:

```js
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

/** Importe de entrada de un área, para el «desde» de la home. */
export function cheapest(area) {
  const groups = area.tiers ?? area.packs
  return Math.min(...groups.flatMap((g) => g.prices.map((p) => p.amount)))
}
```

- [ ] **Step 4: Ejecutar el test y comprobar que pasa**

Run: `npm test`
Expected: PASS — todos los tests de `plans.test.js` y `format.test.js`

Cada entrada de `prices` es una fila visible en la tarjeta: Start muestra dos, Competición tres, y cada modalidad de posing una.

- [ ] **Step 5: Commit**

```bash
git add src/data/plans.js src/data/plans.test.js
git commit -m "Modelo de datos de tarifas con ahorros calculados"
```

---

### Task 3: Utilidades CSS de accesibilidad

Corrige los cuatro defectos de accesibilidad detectados en la auditoría que dependen de CSS.

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Produces: clase `.nums` (cifras tabulares) y `.safe-x` (márgenes seguros laterales), usables por cualquier componente.

- [ ] **Step 1: Añadir las utilidades**

En `src/index.css`, dentro de `@layer components`, justo después del bloque `.field-label`, insertar:

```css
  /* Cifras de ancho fijo: sin esto las columnas de precios bailan */
  .nums {
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum';
  }

  /* Respeta la muesca en móviles apaisados */
  .safe-x {
    padding-left: max(1rem, env(safe-area-inset-left));
    padding-right: max(1rem, env(safe-area-inset-right));
  }
```

- [ ] **Step 2: Reforzar el halo de foco de los campos**

En `src/index.css`, sustituir el bloque `.input-base:focus` completo:

```css
  .input-base:focus {
    outline: none;
    border-color: #9ca3af;
    box-shadow: 0 0 0 3px rgba(156, 163, 175, 0.25);
  }
```

por:

```css
  .input-base:focus-visible {
    outline: none;
    border-color: #e5e7eb;
    box-shadow: 0 0 0 3px rgba(229, 231, 235, 0.55);
  }
```

- [ ] **Step 3: Verificar que el build sigue pasando**

Run: `npm run build`
Expected: termina sin errores

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "Cifras tabulares, márgenes seguros y foco reforzado en campos"
```

---

### Task 4: Componente PlanCard

**Files:**
- Create: `src/components/PlanCard.jsx`
- Create: `src/components/PlanCard.test.jsx`
- Modify: `vitest.config.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: `formatEuro` (Task 1), la forma `Tier`/`Pack` (Task 2), `.nums` (Task 3).
- Produces: `<PlanCard plan={Tier|Pack} onSelect={(planId, priceLabel) => void} />`. Renderiza `<h3>` con el nombre, un `<dl>` con la escalera de precios y un `<button>` por precio.

- [ ] **Step 1: Instalar el entorno de pruebas de componentes**

```bash
npm install -D @testing-library/react@^16.1.0 @testing-library/jest-dom@^6.6.3 jsdom@^25.0.1
```

- [ ] **Step 2: Habilitar jsdom en Vitest**

Sustituir el contenido de `vitest.config.js` por:

```js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{js,jsx}'],
    setupFiles: ['./vitest.setup.js'],
  },
})
```

Crear `vitest.setup.js`:

```js
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 3: Escribir el test que falla**

Crear `src/components/PlanCard.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PlanCard from './PlanCard.jsx'

const PLAN = {
  id: 'competicion',
  name: 'Competición',
  tag: 'Rumbo a la tarima',
  highlight: true,
  summary: 'Para quien quiere competir.',
  prices: [
    { units: 1, label: '1 mes', amount: 150, savings: 0 },
    { units: 3, label: '3 meses', amount: 350, savings: 100 },
  ],
  features: ['Seguimiento diario'],
}

describe('PlanCard', () => {
  it('muestra el nombre como encabezado de nivel 3', () => {
    render(<PlanCard plan={PLAN} onSelect={() => {}} />)
    expect(screen.getByRole('heading', { level: 3, name: /Competición/ })).toBeInTheDocument()
  })

  it('marca la escalera de precios como lista de definiciones', () => {
    const { container } = render(<PlanCard plan={PLAN} onSelect={() => {}} />)
    expect(container.querySelectorAll('dl')).toHaveLength(1)
    expect(container.querySelectorAll('dt')).toHaveLength(2)
    expect(container.querySelectorAll('dd')).toHaveLength(2)
  })

  it('muestra los importes con espacio duro y cifras tabulares', () => {
    const { container } = render(<PlanCard plan={PLAN} onSelect={() => {}} />)
    const dd = container.querySelectorAll('dd')[1]
    expect(dd.textContent).toContain('350\u00A0€')
    expect(dd.className).toContain('nums')
  })

  it('anuncia el ahorro solo cuando lo hay', () => {
    render(<PlanCard plan={PLAN} onSelect={() => {}} />)
    expect(screen.getByText(/ahorras 100/i)).toBeInTheDocument()
    expect(screen.queryByText(/ahorras 0/i)).not.toBeInTheDocument()
  })

  it('indica que el IVA está incluido', () => {
    render(<PlanCard plan={PLAN} onSelect={() => {}} />)
    expect(screen.getByText(/IVA incluido/i)).toBeInTheDocument()
  })

  it('avisa con el plan y la duración elegidos', async () => {
    const onSelect = vi.fn()
    render(<PlanCard plan={PLAN} onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button', { name: /3 meses/ }))
    expect(onSelect).toHaveBeenCalledWith('competicion', '3 meses')
  })
})
```

- [ ] **Step 4: Instalar user-event y ejecutar el test**

```bash
npm install -D @testing-library/user-event@^14.5.2
```

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./PlanCard.jsx"`

- [ ] **Step 5: Implementar el componente**

Crear `src/components/PlanCard.jsx`:

```jsx
import { formatEuro } from '../utils/format.js'

/**
 * Tarjeta de un plan con su escalera de precios.
 *
 * La escalera va en <dl> porque cada duración (dt) tiene un importe (dd):
 * un lector de pantalla las lee emparejadas en lugar de como texto suelto.
 */
export default function PlanCard({ plan, onSelect }) {
  const rim = plan.highlight
    ? 'border-[rgba(229,231,235,0.55)] shadow-[0_0_26px_rgba(229,231,235,0.12)]'
    : ''

  return (
    <article
      id={`plan-${plan.id}`}
      className={`card flex flex-col overflow-hidden p-6 sm:p-7 ${rim}`}
    >
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-steel">{plan.tag}</p>
      <h3 className="text-chrome mt-1.5 font-display text-[26px] font-bold uppercase leading-tight">
        {plan.name}
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-body [text-wrap:pretty]">
        {plan.summary}
      </p>

      <dl className="mt-5 border-t border-line/60">
        {plan.prices.map((price) => (
          <div
            key={price.label}
            className="flex items-baseline justify-between gap-4 border-b border-line/40 py-3"
          >
            <dt className="text-[15px] text-body">{price.label}</dt>
            <dd className="nums text-right font-display text-xl font-bold text-bright">
              {formatEuro(price.amount)}
              {price.savings > 0 && (
                <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-steel">
                  Ahorras {formatEuro(price.savings)}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-dim">IVA incluido</p>

      <ul className="mt-5 flex flex-1 flex-col gap-2 text-[15px] leading-relaxed text-body">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2.5">
            <span aria-hidden="true" className="text-steel">
              ·
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-2.5">
        {plan.prices.map((price) => (
          <button
            key={price.label}
            type="button"
            onClick={() => onSelect(plan.id, price.label)}
            className={plan.highlight ? 'btn-chrome' : 'btn-ghost'}
          >
            Solicitar {price.label}
          </button>
        ))}
      </div>
    </article>
  )
}
```

- [ ] **Step 6: Ejecutar el test y comprobar que pasa**

Run: `npm test`
Expected: PASS — 6 tests de `PlanCard`

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.js vitest.setup.js src/components/PlanCard.jsx src/components/PlanCard.test.jsx
git commit -m "Tarjeta de plan con escalera de precios accesible"
```

---

### Task 5: PlanGrid y AreaCard

**Files:**
- Create: `src/components/PlanGrid.jsx`
- Create: `src/components/AreaCard.jsx`
- Create: `src/components/AreaCard.test.jsx`

**Interfaces:**
- Consumes: `PlanCard` (Task 4), `cheapest` y `ROUTES` (Task 2), `formatEuro` (Task 1).
- Produces:
  - `<PlanGrid plans={Tier[]|Pack[]} onSelect={fn} />`
  - `<AreaCard area={TRAINING|POSING} to={string} unit={'mes'|'clase'} img={string} imgAlt={string} />`

- [ ] **Step 1: Escribir el test que falla**

Crear `src/components/AreaCard.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AreaCard from './AreaCard.jsx'
import { TRAINING } from '../data/plans.js'

const renderCard = () =>
  render(
    <MemoryRouter>
      <AreaCard
        area={TRAINING}
        to="/entrenamiento-y-dietas"
        unit="mes"
        img="/uploads/chery_4.jpeg"
        imgAlt="Chery Figueroa en condición de competición"
      />
    </MemoryRouter>,
  )

describe('AreaCard', () => {
  it('muestra el precio de entrada del área', () => {
    renderCard()
    expect(screen.getByText(/100\u00A0€/)).toBeInTheDocument()
    expect(screen.getByText(/mes/)).toBeInTheDocument()
  })

  it('enlaza al área con un enlace real, no un botón', () => {
    renderCard()
    const link = screen.getByRole('link', { name: /Entrenamiento y Dietas/i })
    expect(link).toHaveAttribute('href', '/entrenamiento-y-dietas')
  })

  it('describe la imagen', () => {
    renderCard()
    expect(screen.getByAltText(/Chery Figueroa/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Instalar el router**

```bash
npm install react-router-dom@^6.28.0
```

- [ ] **Step 3: Ejecutar el test y comprobar que falla**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./AreaCard.jsx"`

- [ ] **Step 4: Implementar PlanGrid**

Crear `src/components/PlanGrid.jsx`:

```jsx
import PlanCard from './PlanCard.jsx'

export default function PlanGrid({ plans, onSelect }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} onSelect={onSelect} />
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Implementar AreaCard**

Crear `src/components/AreaCard.jsx`:

```jsx
import { Link } from 'react-router-dom'
import { cheapest } from '../data/plans.js'
import { formatEuro } from '../utils/format.js'

/**
 * Tarjeta de área en la home. El «desde» filtra: quien pulsa ya conoce el
 * orden de precio, así que llegan menos consultas de curioseo.
 */
export default function AreaCard({ area, to, unit, img, imgAlt }) {
  return (
    <article className="card flex flex-col overflow-hidden">
      <div className="mx-3 mt-3 h-64 overflow-hidden rounded-xl border border-line/80 sm:h-72">
        <img
          src={img}
          alt={imgAlt}
          width="1080"
          height="1718"
          loading="lazy"
          className="h-full w-full object-cover"
          style={{ objectPosition: '50% 12%' }}
        />
      </div>
      <div className="flex flex-1 flex-col px-6 pb-7 pt-6">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-steel">{area.tag}</p>
        <h3 className="text-chrome mt-1.5 font-display text-[24px] font-bold uppercase leading-tight">
          {area.name}
        </h3>
        <p className="mt-2.5 flex-1 text-[15px] leading-relaxed text-body [text-wrap:pretty]">
          {area.summary}
        </p>
        <p className="mt-4 text-sm text-dim">
          Desde{' '}
          <span className="nums font-display text-xl font-bold text-bright">
            {formatEuro(cheapest(area))}
          </span>{' '}
          / {unit}
        </p>
        <Link to={to} className="btn-chrome mt-4">
          {area.name}
        </Link>
      </div>
    </article>
  )
}
```

- [ ] **Step 6: Ejecutar el test y comprobar que pasa**

Run: `npm test`
Expected: PASS — 3 tests de `AreaCard`

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/components/PlanGrid.jsx src/components/AreaCard.jsx src/components/AreaCard.test.jsx
git commit -m "Rejilla de planes y tarjeta de área con precio de entrada"
```

---

### Task 6: Enrutado y extracción de la home

**Files:**
- Create: `src/pages/Home.jsx`
- Modify: `src/App.jsx`
- Modify: `src/main.jsx`
- Modify: `src/data/content.js:17-24` (NAV_LINKS)
- Modify: `src/components/Header.jsx`
- Create: `src/components/Header.test.jsx`

**Interfaces:**
- Consumes: `ROUTES` (Task 2).
- Produces: `NAV_LINKS: { to: string, label: string, hash?: boolean }[]`. `App` monta `<Routes>` con las tres rutas.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/components/Header.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Header from './Header.jsx'

const renderHeader = () =>
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  )

describe('Header', () => {
  it('enlaza las dos áreas de servicio', () => {
    renderHeader()
    expect(screen.getAllByRole('link', { name: 'Entrenamiento' })[0]).toHaveAttribute(
      'href',
      '/entrenamiento-y-dietas',
    )
    expect(screen.getAllByRole('link', { name: 'Posing' })[0]).toHaveAttribute('href', '/posing')
  })

  it('cierra el menú móvil con Escape y devuelve el foco al botón', async () => {
    renderHeader()
    const toggle = screen.getByRole('button', { name: /Abrir menú/ })
    await userEvent.click(toggle)
    expect(screen.getByRole('button', { name: /Cerrar menú/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await userEvent.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: /Abrir menú/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.getByRole('button', { name: /Abrir menú/ })).toHaveFocus()
  })
})
```

- [ ] **Step 2: Ejecutar el test y comprobar que falla**

Run: `npm test`
Expected: FAIL — no encuentra el enlace «Entrenamiento»

- [ ] **Step 3: Actualizar NAV_LINKS**

En `src/data/content.js`, sustituir el bloque `NAV_LINKS` completo por:

```js
import { ROUTES } from './plans.js'

export const NAV_LINKS = [
  { to: ROUTES.home, label: 'Inicio' },
  { to: ROUTES.training, label: 'Entrenamiento' },
  { to: ROUTES.posing, label: 'Posing' },
  { to: `${ROUTES.home}#nosotras`, label: 'Nosotras' },
  { to: `${ROUTES.home}#galeria`, label: 'Galería' },
  { to: `${ROUTES.home}#contacto`, label: 'Contacto' },
]
```

Colocar el `import` en la primera línea del fichero.

- [ ] **Step 4: Actualizar Header para usar Link y cerrar con Escape**

En `src/components/Header.jsx`, sustituir la primera línea de imports y el cuerpo del componente hasta la apertura del `<header>`:

```jsx
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { NAV_LINKS } from '../data/content.js'
import { IconMenu, IconClose } from './ui/Icons.jsx'

export default function Header() {
  const [open, setOpen] = useState(false)
  const toggleRef = useRef(null)
  const close = () => setOpen(false)

  // Sin esto, quien navega con teclado queda atrapado dentro del menú abierto.
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])
```

Después, en el mismo fichero:
- sustituir cada `<a href={link.href} …>` de navegación por `<Link to={link.to} …>` y su cierre `</a>` por `</Link>`;
- sustituir `key={link.href}` por `key={link.to}`;
- sustituir el logotipo `<a href="#inicio" onClick={close} …>` por `<Link to="/" onClick={close} …>`;
- sustituir los dos `<a href="#contacto" …>Solicitar consulta</a>` por `<Link to="/#contacto" …>Solicitar consulta</Link>`;
- añadir `ref={toggleRef}` al `<button>` del menú móvil.

- [ ] **Step 4b: Proteger los identificadores de marca del traductor automático**

El traductor de Chrome convierte «Wellness PRO» en «Bienestar PRO» y altera «IFBB». Buena parte de la audiencia de Chery es internacional, así que conviene marcarlos.

En `src/components/Header.jsx`, en el `<span>` del logotipo:

```jsx
<span
  translate="no"
  className="font-display text-sm font-bold uppercase tracking-[0.18em] text-bright"
>
  CW Wellness&nbsp;PRO
</span>
```

En `src/components/Footer.jsx`, envolver el nombre de marca del aviso de copyright:

```jsx
<p className="text-center text-[11px] uppercase tracking-wider text-[#7c828c]">
  © 2026 <span translate="no">Chery Figueroa Wellness PRO</span> · Elite Coaching ·
  Bodybuilding · Wellness Aesthetics
</p>
```

- [ ] **Step 5: Extraer la home a su propia página**

Crear `src/pages/Home.jsx` con el contenido actual de `App.jsx` desde `<Hero />` hasta `<Contact />`:

```jsx
import Hero from '../components/Hero.jsx'
import Areas from '../components/Areas.jsx'
import EventsTicker from '../components/EventsTicker.jsx'
import About from '../components/About.jsx'
import Testimonials from '../components/Testimonials.jsx'
import Gallery from '../components/Gallery.jsx'
import Faq from '../components/Faq.jsx'
import Contact from '../components/Contact.jsx'
import SectionDivider from '../components/ui/SectionDivider.jsx'

export default function Home() {
  return (
    <>
      <Hero />
      <Areas />
      <EventsTicker />
      <SectionDivider />
      <About />
      <SectionDivider />
      <Testimonials />
      <SectionDivider />
      <Gallery />
      <SectionDivider />
      <Faq />
      <SectionDivider />
      <Contact />
    </>
  )
}
```

- [ ] **Step 6: Crear la sección Areas que sustituye a Services**

Crear `src/components/Areas.jsx`:

```jsx
import { TRAINING, POSING, ROUTES } from '../data/plans.js'
import AreaCard from './AreaCard.jsx'

export default function Areas() {
  return (
    <section id="servicios" aria-labelledby="titulo-servicios" className="scroll-mt-24">
      <div className="safe-x mx-auto max-w-6xl pt-11 sm:px-6">
        <h2 id="titulo-servicios" className="sr-only">
          Servicios
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <AreaCard
            area={TRAINING}
            to={ROUTES.training}
            unit="mes"
            img="/uploads/chery_4.jpeg"
            imgAlt="Chery Figueroa en condición de competición durante el IFBB Pro League de Pittsburgh"
          />
          <AreaCard
            area={POSING}
            to={ROUTES.posing}
            unit="clase"
            img="/uploads/chery_2.jpeg"
            imgAlt="Chery Figueroa en pose frontal sobre la tarima del Miami Pro"
          />
        </div>
      </div>
    </section>
  )
}
```

Borrar `src/components/Services.jsx`: queda sin uso.

- [ ] **Step 7: Montar las rutas en App**

Sustituir el contenido de `src/App.jsx` por:

```jsx
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import { ROUTES } from './data/plans.js'

export default function App() {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only z-[60] rounded-lg bg-bright px-4 py-3 font-semibold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Saltar al contenido principal
      </a>
      <Header />
      <main id="contenido">
        <Routes>
          <Route path={ROUTES.home} element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 8: Envolver el cliente en BrowserRouter**

En `src/main.jsx`, importar `BrowserRouter` y envolver `<App />`:

```jsx
import { BrowserRouter } from 'react-router-dom'
```

y sustituir la constante `tree` por:

```jsx
const tree = (
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

- [ ] **Step 9: Ejecutar los tests y el build**

Run: `npm test && npm run build`
Expected: PASS y build sin errores

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "Enrutado con react-router y home extraída a su propia página"
```

---

### Task 7: Campo de plan en el formulario

**Files:**
- Modify: `src/utils/validation.js`
- Modify: `src/components/ContactForm.jsx`
- Create: `src/components/ContactForm.test.jsx`

**Interfaces:**
- Consumes: `TRAINING`, `POSING` (Task 2).
- Produces: `ContactForm` acepta `presetPlan?: string` y expone `PLAN_OPTIONS: string[]` desde `validation.js`. El identificador del campo es `plan`.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/components/ContactForm.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Ejecutar el test y comprobar que falla**

Run: `npm test`
Expected: FAIL — no encuentra el campo «Plan»

- [ ] **Step 3: Añadir las opciones de plan a validation.js**

Al final de `src/utils/validation.js`, añadir:

```js
import { TRAINING, POSING } from '../data/plans.js'

/**
 * Etiquetas de plan aceptadas. Se derivan de plans.js, así que un precio
 * nuevo aparece en el formulario sin tocar este fichero.
 */
export const PLAN_OPTIONS = [
  ...TRAINING.tiers.flatMap((tier) =>
    tier.prices.map((price) => `${tier.name} · ${price.label}`),
  ),
  ...POSING.packs.flatMap((pack) =>
    pack.prices.map((price) => `Posing · ${price.label}`),
  ),
]
```

Añadir `plan` a la lista de campos validados: dentro de `validateForm`, tratar `plan` como select verificado contra `PLAN_OPTIONS` (mismo patrón que los demás selects, no obligatorio).

- [ ] **Step 4: Añadir el campo al formulario**

En `src/components/ContactForm.jsx`:
- añadir `plan: ''` a `INITIAL`, como primera propiedad;
- aceptar la prop: `export default function ContactForm({ presetPlan = '' })`;
- inicializar el estado con el plan recibido:

```jsx
const [values, setValues] = useState({ ...INITIAL, plan: presetPlan })
```

- añadir, justo antes del `<SelectField id="objetivo" …>`, el campo:

```jsx
<SelectField
  id="plan"
  label="Plan que te interesa"
  options={PLAN_OPTIONS}
  placeholder="Aún no lo tengo claro"
  value={values.plan}
  onChange={setField}
  error={errors.plan}
/>
```

- importar `PLAN_OPTIONS` desde `../utils/validation.js`;
- incluir el plan en el mensaje generado por `buildMessage`.

- [ ] **Step 5: Ejecutar el test y comprobar que pasa**

Run: `npm test`
Expected: PASS — 2 tests de `ContactForm`

- [ ] **Step 6: Commit**

```bash
git add src/utils/validation.js src/components/ContactForm.jsx src/components/ContactForm.test.jsx
git commit -m "Campo de plan en el formulario, derivado de las tarifas"
```

---

### Task 8: Páginas de servicio

**Files:**
- Create: `src/components/ServicePage.jsx`
- Create: `src/pages/TrainingPage.jsx`
- Create: `src/pages/PosingPage.jsx`
- Modify: `src/App.jsx`
- Modify: `src/data/content.js` (repartir FAQS por tema)

**Interfaces:**
- Consumes: `PlanGrid` (Task 5), `ContactForm` con `presetPlan` (Task 7), `FAQS` (existente).
- Produces: `<ServicePage area={TRAINING|POSING} plans={...} faqs={...} intro={string} />`.

- [ ] **Step 1: Repartir las FAQ existentes por tema**

En `src/data/content.js`, después de `FAQS`, añadir (sin inventar preguntas nuevas):

```js
/** Reparto por tema de las FAQ ya existentes. La home las muestra todas. */
export const FAQS_TRAINING = FAQS.filter((faq) =>
  ['experiencia', 'preparación', 'seguimiento', 'competir'].some((k) =>
    `${faq.q} ${faq.a}`.toLowerCase().includes(k),
  ),
)

export const FAQS_POSING = FAQS.filter((faq) =>
  `${faq.q} ${faq.a}`.toLowerCase().includes('posing'),
)
```

- [ ] **Step 2: Implementar ServicePage**

Crear `src/components/ServicePage.jsx`:

```jsx
import { useRef, useState } from 'react'
import ChromeHeading from './ui/ChromeHeading.jsx'
import PlanGrid from './PlanGrid.jsx'
import ContactForm from './ContactForm.jsx'
import SectionDivider from './ui/SectionDivider.jsx'

/**
 * Plantilla de las dos páginas de servicio.
 *
 * Al elegir un plan, el foco salta al campo «Plan» del formulario de esta
 * misma página, ya relleno: quien acaba de decidirse no debe ir a otro sitio
 * a escribir.
 */
export default function ServicePage({ area, plans, faqs, intro }) {
  const [preset, setPreset] = useState('')
  const formRef = useRef(null)

  const select = (planId, priceLabel) => {
    const plan = plans.find((p) => p.id === planId)
    const label = area.packs ? `Posing · ${priceLabel}` : `${plan.name} · ${priceLabel}`
    setPreset(label)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // El campo existe tras el re-render provocado por setPreset.
    requestAnimationFrame(() => document.getElementById('plan')?.focus())
  }

  return (
    <>
      <section aria-labelledby="titulo-area" className="scroll-mt-24">
        <div className="safe-x mx-auto max-w-6xl pt-10 sm:px-6">
          <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-steel">
            {area.tag}
          </p>
          {/* Cada ruta necesita su propio h1: el de la home vive en Hero. */}
          <ChromeHeading
            as="h1"
            id="titulo-area"
            className="mb-4 mt-2 text-4xl sm:text-5xl lg:text-[58px]"
          >
            {area.name}
          </ChromeHeading>
          <p className="mx-auto mb-10 max-w-2xl text-center text-[15px] leading-relaxed text-body [text-wrap:pretty]">
            {intro}
          </p>
          <PlanGrid plans={plans} onSelect={select} />
        </div>
      </section>

      {faqs.length > 0 && (
        <>
          <SectionDivider />
          <section aria-labelledby="titulo-faq-servicio" className="scroll-mt-24">
            <div className="safe-x mx-auto max-w-6xl sm:px-6">
              <div className="panel p-6 sm:p-11">
                <ChromeHeading
                  id="titulo-faq-servicio"
                  className="mb-9 text-3xl sm:text-4xl"
                >
                  Preguntas frecuentes
                </ChromeHeading>
                <dl className="mx-auto flex max-w-3xl flex-col gap-5">
                  {faqs.map((faq) => (
                    <div key={faq.q} className="card rounded-xl p-6">
                      <dt className="text-[15px] font-semibold text-bright">{faq.q}</dt>
                      <dd className="mt-2 text-[15px] leading-[1.75] text-body [text-wrap:pretty]">
                        {faq.a}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>
        </>
      )}

      <SectionDivider />

      <section id="solicitar" ref={formRef} aria-labelledby="titulo-solicitar" className="scroll-mt-24">
        <div className="safe-x mx-auto max-w-6xl pb-6 sm:px-6">
          <div className="panel p-6 sm:p-11">
            <ChromeHeading id="titulo-solicitar" className="mb-3 text-4xl sm:text-5xl">
              Solicitar plaza
            </ChromeHeading>
            <p className="mx-auto mb-9 max-w-lg text-center text-[15px] leading-relaxed text-dim [text-wrap:pretty]">
              Las plazas del equipo son limitadas. Chery revisa personalmente cada solicitud.
            </p>
            <ContactForm key={preset} presetPlan={preset} />
          </div>
        </div>
      </section>
    </>
  )
}
```

- [ ] **Step 3: Crear las dos páginas**

Crear `src/pages/TrainingPage.jsx`:

```jsx
import ServicePage from '../components/ServicePage.jsx'
import { TRAINING } from '../data/plans.js'
import { FAQS_TRAINING } from '../data/content.js'

export default function TrainingPage() {
  return (
    <ServicePage
      area={TRAINING}
      plans={TRAINING.tiers}
      faqs={FAQS_TRAINING}
      intro={TRAINING.summary}
    />
  )
}
```

Crear `src/pages/PosingPage.jsx`:

```jsx
import ServicePage from '../components/ServicePage.jsx'
import { POSING } from '../data/plans.js'
import { FAQS_POSING } from '../data/content.js'

export default function PosingPage() {
  return (
    <ServicePage area={POSING} plans={POSING.packs} faqs={FAQS_POSING} intro={POSING.summary} />
  )
}
```

- [ ] **Step 4: Registrar las rutas**

En `src/App.jsx`, importar ambas páginas y añadir dentro de `<Routes>`:

```jsx
<Route path={ROUTES.training} element={<TrainingPage />} />
<Route path={ROUTES.posing} element={<PosingPage />} />
```

- [ ] **Step 5: Comprobar en el navegador**

Run: `npm run dev`
Expected: `/entrenamiento-y-dietas` y `/posing` muestran sus tarjetas; pulsar «Solicitar 3 meses» baja al formulario con el plan relleno.

- [ ] **Step 6: Ejecutar tests y build**

Run: `npm test && npm run build`
Expected: PASS y build sin errores

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Páginas de Entrenamiento y Posing con solicitud contextual"
```

---

### Task 9: SEO por ruta

**Files:**
- Modify: `src/data/seo.js`
- Create: `src/data/seo.test.js`

**Interfaces:**
- Consumes: `ROUTES`, `TRAINING`, `POSING` (Task 2), `FAQS_TRAINING`, `FAQS_POSING` (Task 8).
- Produces: `PAGES: Record<'home'|'training'|'posing', { path, title, description }>`, `buildMetaTags(pageKey)`, `buildJsonLd(pageKey)`, `renderHead(pageKey): string`, `buildSitemap(lastmod)` con las tres URLs.

- [ ] **Step 1: Definir las tres páginas**

En `src/data/seo.js`, añadir tras `SITE`:

```js
import { ROUTES, TRAINING, POSING } from './plans.js'

export const PAGES = {
  home: {
    path: ROUTES.home,
    title: SITE.title,
    description: SITE.description,
  },
  training: {
    path: ROUTES.training,
    title: 'Entrenamiento y Dietas — Planes de coaching | Chery Figueroa Wellness PRO',
    description:
      'Planes de dieta y entrenamiento con seguimiento, desde 100 € al mes. Plan Start para construir base y plan Competición para preparar tarima con Chery Figueroa, IFBB Pro.',
  },
  posing: {
    path: ROUTES.posing,
    title: 'Clases de Posing Wellness — Sala privada | Chery Figueroa Wellness PRO',
    description:
      'Clases de posing de competición en sala privada, desde 60 €. Técnica de pose, transiciones y poses reglamentarias Wellness con Chery Figueroa, IFBB Pro.',
  },
}
```

- [ ] **Step 2: Parametrizar las metaetiquetas por página**

Cambiar la firma de `buildMetaTags()` a `buildMetaTags(pageKey = 'home')` y sustituir dentro todas las apariciones de `SITE.title`, `SITE.description` y `` `${SITE.url}/` `` por los valores de la página:

```js
export function buildMetaTags(pageKey = 'home') {
  const page = PAGES[pageKey]
  const url = `${SITE.url}${page.path}`
  return [
    { rel: 'canonical', href: url },
    { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
    { name: 'author', content: 'Chery Figueroa Calix' },

    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: SITE.name },
    { property: 'og:locale', content: SITE.locale },
    { property: 'og:url', content: url },
    { property: 'og:title', content: page.title },
    { property: 'og:description', content: page.description },
    { property: 'og:image', content: abs(SITE.ogImage) },
    { property: 'og:image:width', content: String(SITE.ogImageWidth) },
    { property: 'og:image:height', content: String(SITE.ogImageHeight) },
    { property: 'og:image:alt', content: SITE.ogImageAlt },

    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: page.title },
    { name: 'twitter:description', content: page.description },
    { name: 'twitter:image', content: abs(SITE.ogImage) },
    { name: 'twitter:image:alt', content: SITE.ogImageAlt },
  ]
}
```

- [ ] **Step 3: Añadir Service, Offer y BreadcrumbList**

Cambiar la firma a `buildJsonLd(pageKey = 'home')`. Para `home` se devuelve el grafo actual. Para las dos páginas de servicio, se devuelve:

```js
function serviceGraph(area, groups, pageKey, faqs) {
  const page = PAGES[pageKey]
  const url = `${SITE.url}${page.path}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Solo se publica FAQPage si la ruta muestra realmente esas preguntas:
      // marcar preguntas que no están en la página incumple las directrices.
      ...(faqs.length > 0
        ? [
            {
              '@type': 'FAQPage',
              '@id': `${url}#faq`,
              inLanguage: SITE.lang,
              mainEntity: faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.q,
                acceptedAnswer: { '@type': 'Answer', text: faq.a },
              })),
            },
          ]
        : []),
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: area.name,
        description: area.summary,
        url,
        serviceType: area.name,
        provider: { '@id': `${SITE.url}/#business` },
        areaServed: { '@type': 'Country', name: 'España' },
        inLanguage: SITE.lang,
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `Tarifas de ${area.name}`,
          itemListElement: groups.flatMap((group) =>
            group.prices.map((price) => ({
              '@type': 'Offer',
              name: `${group.name} · ${price.label}`,
              description: group.summary,
              price: String(price.amount),
              priceCurrency: 'EUR',
              availability: 'https://schema.org/InStock',
              url,
            })),
          ),
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE.url}/` },
          { '@type': 'ListItem', position: 2, name: area.name, item: url },
        ],
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        inLanguage: SITE.lang,
        isPartOf: { '@id': `${SITE.url}/#website` },
      },
    ],
  }
}
```

y en `buildJsonLd`:

```js
export function buildJsonLd(pageKey = 'home') {
  if (pageKey === 'training')
    return serviceGraph(TRAINING, TRAINING.tiers, pageKey, FAQS_TRAINING)
  if (pageKey === 'posing') return serviceGraph(POSING, POSING.packs, pageKey, FAQS_POSING)
  return homeGraph()   // el grafo actual, renombrado a homeGraph
}
```

Importar `FAQS_TRAINING` y `FAQS_POSING` desde `./content.js` en la cabecera de `seo.js`.

- [ ] **Step 4: Añadir renderHead**

Al final de `src/data/seo.js`:

```js
/** Devuelve el <head> completo de una ruta, listo para insertar en el HTML. */
export function renderHead(pageKey) {
  const page = PAGES[pageKey]
  const esc = (value) =>
    String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

  const tags = [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}">`,
    ...buildMetaTags(pageKey).map(({ rel, ...attrs }) => {
      const pairs = Object.entries(rel ? { rel, ...attrs } : attrs)
        .map(([k, v]) => `${k}="${esc(v)}"`)
        .join(' ')
      return rel ? `<link ${pairs}>` : `<meta ${pairs}>`
    }),
    `<script type="application/ld+json">${JSON.stringify(buildJsonLd(pageKey)).replace(/</g, '\\u003c')}</script>`,
  ]

  return tags.map((tag) => `    ${tag}`).join('\n')
}
```

- [ ] **Step 5: Ampliar el sitemap a tres URLs**

Sustituir `buildSitemap` por:

```js
export function buildSitemap(lastmod) {
  const urls = Object.values(PAGES)
    .map(
      (page) => `  <url>
    <loc>${SITE.url}${page.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${page.path === '/' ? '1.0' : '0.8'}</priority>
  </url>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}
```

- [ ] **Step 5b: Alinear el catálogo de la home con las dos áreas**

`homeGraph` deriva hoy su `serviceType` y su `hasOfferCatalog` de `SERVICES`, que describe los tres servicios antiguos. Tras la reestructuración la home muestra dos áreas, así que el schema estaría anunciando una oferta que la página ya no tiene. En `src/data/seo.js:107` y `:111`, sustituir ambos usos:

```js
        serviceType: [TRAINING.name, POSING.name],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Áreas de coaching',
          itemListElement: [TRAINING, POSING].map((area) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: area.name,
              description: area.summary,
              url: `${SITE.url}${area.slug}`,
              provider: { '@id': `${SITE.url}/#business` },
              areaServed: { '@type': 'Country', name: 'España' },
            },
          })),
        },
```

Quitar `SERVICES` del `import` de `./content.js` en `src/data/seo.js:5`, y borrar el export `SERVICES` de `src/data/content.js`: tras la tarea 6 ya no lo usa nadie más.

- [ ] **Step 6: Escribir el test de la capa SEO**

Esta tarea se verifica sola, sin depender del prerender. Crear `src/data/seo.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { PAGES, buildJsonLd, buildMetaTags, buildSitemap, renderHead } from './seo.js'

describe('buildMetaTags', () => {
  it('da a cada ruta una canónica que apunta a sí misma', () => {
    for (const [key, page] of Object.entries(PAGES)) {
      const canonical = buildMetaTags(key).find((tag) => tag.rel === 'canonical')
      expect(canonical.href).toBe(`https://cherywellnesspro.com${page.path}`)
    }
  })

  it('no repite el mismo título en dos rutas', () => {
    const titles = Object.values(PAGES).map((page) => page.title)
    expect(new Set(titles).size).toBe(titles.length)
  })
})

describe('buildJsonLd', () => {
  it('publica las ofertas de entrenamiento con importe y moneda', () => {
    const service = buildJsonLd('training')['@graph'].find((n) => n['@type'] === 'Service')
    const offers = service.hasOfferCatalog.itemListElement
    expect(offers.map((o) => o.price)).toEqual(['100', '250', '150', '350', '600'])
    offers.forEach((offer) => expect(offer.priceCurrency).toBe('EUR'))
  })

  it('publica las ofertas de posing', () => {
    const service = buildJsonLd('posing')['@graph'].find((n) => n['@type'] === 'Service')
    expect(service.hasOfferCatalog.itemListElement.map((o) => o.price)).toEqual(['60', '200'])
  })

  it('incluye migas de pan en las rutas de servicio', () => {
    for (const key of ['training', 'posing']) {
      const types = buildJsonLd(key)['@graph'].map((n) => n['@type'])
      expect(types).toContain('BreadcrumbList')
    }
  })
})

describe('buildSitemap', () => {
  it('lista las tres rutas', () => {
    const xml = buildSitemap('2026-07-29')
    expect(xml.match(/<loc>/g)).toHaveLength(3)
    expect(xml).toContain('<loc>https://cherywellnesspro.com/posing</loc>')
  })
})

describe('renderHead', () => {
  it('devuelve un head con título, canónica y JSON-LD válido', () => {
    const head = renderHead('posing')
    expect(head).toContain('<title>')
    expect(head).toContain('rel="canonical"')
    const json = head.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]
    expect(() => JSON.parse(json.replace(/\\u003c/g, '<'))).not.toThrow()
  })

  it('escapa las comillas para no romper los atributos', () => {
    expect(renderHead('training')).not.toMatch(/content="[^"]*"[^">]*"/)
  })
})
```

- [ ] **Step 7: Ejecutar el test**

Run: `npm test`
Expected: PASS — todos los tests de `seo.test.js`

Nota: `renderHead` todavía no se usa en ningún sitio. Lo consume la tarea 10.

- [ ] **Step 8: Commit**

```bash
git add src/data/seo.js src/data/seo.test.js
git commit -m "SEO por ruta con Service, Offer y BreadcrumbList"
```

---

### Task 10: Prerender de las tres rutas

El prerender debe producir los tres HTML **antes** de que vite-plugin-pwa calcule el precache. El plugin `chery-seo-html` ya está declarado antes de `VitePWA` en el array de plugins, así que su `closeBundle` corre primero y workbox calcula los hashes sobre los ficheros finales.

**Files:**
- Modify: `src/entry-server.jsx`
- Modify: `vite.config.js`

**Interfaces:**
- Consumes: `ROUTES` (Task 2), `renderHead(pageKey)`, `buildSitemap` y `buildRobots` (Task 9).
- Produces: `render(url: string): string` en `entry-server.jsx`. Tras esta tarea, `dist/` contiene `index.html`, `entrenamiento-y-dietas/index.html` y `posing/index.html`.

- [ ] **Step 1: Adaptar la entrada de servidor**

Sustituir el contenido de `src/entry-server.jsx` por:

```jsx
// Entrada de renderizado en servidor. Se compila con `vite build --ssr` y la
// consume el plugin `chery-seo-html` para incrustar el HTML ya renderizado.
//
// No importa CSS ni fuentes: los estilos los aporta el build de cliente.

import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from './App.jsx'

export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  )
}
```

- [ ] **Step 2: Marcar el hueco del SEO en el build**

En `vite.config.js`, dentro del handler de `transformIndexHtml`, sustituir el bloque que devuelve `{ html, tags }` tras el prerender por una versión que, **en build**, no inyecte tags y deje un marcador:

```js
        // En build generamos las tres rutas en closeBundle, donde ya conocemos
        // el HTML final con las etiquetas de assets. Aquí solo dejamos el hueco.
        if (isBuild) {
          return html.replace('</head>', `${SEO_SLOT}\n  </head>`)
        }

        return { html, tags }
```

y declarar arriba del fichero:

```js
const SEO_SLOT = '<!--CHERY_SEO-->'
```

- [ ] **Step 3: Generar los tres HTML en closeBundle**

Sustituir el `closeBundle` de `seoHtml` por:

```js
    // `closeBundle` corre después de que Vite haya escrito dist/ y ANTES del
    // closeBundle de vite-plugin-pwa, porque este plugin va primero en el
    // array. Por eso workbox calcula los hashes sobre los HTML ya finales.
    async closeBundle() {
      const distDir = resolve(ROOT, 'dist')
      const template = readFileSync(resolve(distDir, 'index.html'), 'utf8')

      if (!template.includes(SEO_SLOT)) {
        this.error('No se encontró el marcador de SEO en dist/index.html')
      }

      const { render } = await import(pathToFileURL(SSR_ENTRY).href)

      for (const [key, route] of Object.entries(ROUTES)) {
        const head = renderHead(key)
        const body = render(route)
        const html = template
          .replace(SEO_SLOT, head)
          .replace('<div id="root"></div>', `<div id="root">${body}</div>`)

        const file =
          route === '/'
            ? resolve(distDir, 'index.html')
            : resolve(distDir, route.replace(/^\//, ''), 'index.html')
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, html)
      }

      const lastmod = new Date().toISOString().slice(0, 10)
      writeFileSync(resolve(distDir, 'sitemap.xml'), buildSitemap(lastmod))
      writeFileSync(resolve(distDir, 'robots.txt'), buildRobots())
      this.info(`Prerenderizadas ${Object.keys(ROUTES).length} rutas`)
    },
```

El `transformIndexHtml` deja de prerenderizar la home: ahora las tres rutas se generan aquí. Elimina de ese handler el bloque `if (!isBuild || !existsSync(SSR_ENTRY)) return { html, tags }` y su `import()`, que quedan sustituidos por el marcador del paso anterior.

- [ ] **Step 4: Añadir los imports que faltan**

En la cabecera de `vite.config.js`:

```js
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { ROUTES } from './src/data/plans.js'
```

- [ ] **Step 5: Verificar la generación**

Run: `npm run build`
Expected: mensaje «Prerenderizadas 3 rutas»

Run: `ls dist/entrenamiento-y-dietas/index.html dist/posing/index.html`
Expected: ambos existen

- [ ] **Step 6: Commit**

```bash
git add vite.config.js src/entry-server.jsx
git commit -m "Prerender de las tres rutas antes del cálculo de precache"
```

---

### Task 11: Verificación automática

Implementa los siete criterios de aceptación del spec.

**Files:**
- Create: `playwright.config.js`
- Create: `tests/e2e/a11y.spec.js`
- Create: `tests/e2e/responsive.spec.js`
- Create: `scripts/check-precache.mjs`
- Modify: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Instalar Playwright y axe**

```bash
npm install -D @playwright/test@^1.49.1 @axe-core/playwright@^4.10.1
npx playwright install chromium
```

- [ ] **Step 2: Configurar Playwright**

Crear `playwright.config.js`:

```js
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://localhost:4173' },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
```

- [ ] **Step 3: Escribir la prueba de accesibilidad**

Crear `tests/e2e/a11y.spec.js`:

```js
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const ROUTES = ['/', '/entrenamiento-y-dietas', '/posing']

for (const route of ROUTES) {
  test(`axe no reporta violaciones en ${route}`, async ({ page }) => {
    await page.goto(route)
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(violations.map((v) => `${v.id}: ${v.nodes.length} nodo(s)`)).toEqual([])
  })

  test(`sin errores ni avisos de hidratación en ${route}`, async ({ page }) => {
    const problems = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') problems.push(msg.text())
    })
    page.on('pageerror', (error) => problems.push(String(error)))
    await page.goto(route)
    await page.waitForLoadState('networkidle')
    expect(problems).toEqual([])
  })

  test(`el HTML llega prerenderizado en ${route}`, async ({ request }) => {
    const html = await (await request.get(route)).text()
    expect(html).not.toContain('<div id="root"></div>')
    expect(html).toContain('<h1')
  })

  test(`hay exactamente un h1 en ${route}`, async ({ page }) => {
    await page.goto(route)
    await expect(page.locator('h1')).toHaveCount(1)
  })

  test(`la canónica de ${route} apunta a sí misma`, async ({ page }) => {
    await page.goto(route)
    const href = await page.locator('link[rel=canonical]').getAttribute('href')
    expect(href).toBe(`https://cherywellnesspro.com${route}`)
  })
}

test('el salto desde un plan preselecciona ese plan', async ({ page }) => {
  await page.goto('/entrenamiento-y-dietas')
  await page.getByRole('button', { name: 'Solicitar 3 meses' }).first().click()
  await expect(page.getByLabel(/Plan que te interesa/i)).toHaveValue(/· 3 meses$/)
})

test('el menú móvil se cierra con Escape', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto('/')
  await page.getByRole('button', { name: /Abrir menú/ }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: /Abrir menú/ })).toBeFocused()
})
```

- [ ] **Step 4: Escribir la prueba de anchos**

Crear `tests/e2e/responsive.spec.js`:

```js
import { test, expect } from '@playwright/test'

const ROUTES = ['/', '/entrenamiento-y-dietas', '/posing']
const WIDTHS = [320, 375, 768, 1024, 1440]

for (const route of ROUTES) {
  for (const width of WIDTHS) {
    test(`sin scroll horizontal en ${route} a ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow).toBeLessThanOrEqual(0)
    })

    // Botones y CTA a 44 px (criterio AAA de WCAG 2.5.5), enlaces de
    // navegación a 24 px (criterio AA de WCAG 2.5.8). El menú y el pie usan
    // enlaces de texto y no se agrandan: conservar el diseño es un requisito.
    test(`destinos táctiles suficientes en ${route} a ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(route)
      const small = await page.evaluate(() => {
        const min = (el) => (el.tagName === 'BUTTON' || el.classList.contains('btn-chrome') || el.classList.contains('btn-ghost') ? 44 : 24)
        return [...document.querySelectorAll('a, button')]
          .filter((el) => el.offsetParent !== null)
          .map((el) => ({
            text: el.textContent.trim().slice(0, 30),
            h: el.getBoundingClientRect().height,
            min: min(el),
          }))
          .filter((el) => el.h > 0 && el.h < el.min)
      })
      expect(small).toEqual([])
    })
  }
}
```

- [ ] **Step 5: Escribir la comprobación del precache**

Crear `scripts/check-precache.mjs`:

```js
// Verifica que el hash de cada HTML en sw.js coincide con el fichero en disco.
// Si no coinciden, el service worker sirve una versión obsoleta de la página.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const PAGES = ['index.html', 'entrenamiento-y-dietas/index.html', 'posing/index.html']
const sw = readFileSync('dist/sw.js', 'utf8')
let failed = false

for (const page of PAGES) {
  const md5 = createHash('md5').update(readFileSync(`dist/${page}`)).digest('hex')
  if (!sw.includes(md5)) {
    console.error(`✗ ${page}: el hash ${md5} no aparece en sw.js`)
    failed = true
  } else {
    console.log(`✓ ${page}`)
  }
}

process.exit(failed ? 1 : 0)
```

- [ ] **Step 6: Añadir los scripts**

En `package.json`, dentro de `"scripts"`:

```json
"test:e2e": "playwright test",
"check": "npm test && npm run build && node scripts/check-precache.mjs && npm run test:e2e"
```

Y en `.gitignore`, añadir:

```
test-results
playwright-report
```

- [ ] **Step 7: Ejecutar la verificación completa**

Run: `npm run check`
Expected: todo en verde. **Cualquier fallo se corrige antes de continuar**; no se documenta como limitación conocida.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Verificación automática: axe, anchos, hidratación y precache"
```

---

### Task 12: Documentación

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Actualizar el README**

En la sección `## Comandos`, añadir:

```bash
npm test          # tests unitarios y de componentes (Vitest)
npm run test:e2e  # accesibilidad y anchos de pantalla (Playwright)
npm run check     # verificación completa antes de desplegar
```

Añadir una sección `## Tarifas` explicando que los precios viven en `src/data/plans.js` y que de ahí salen a la vez las tarjetas, el formulario y el JSON-LD, y una sección `## Rutas` con las tres URLs y la nota de que `sitemap.xml` se genera solo.

En `## Estructura`, añadir `data/plans.js`, `utils/format.js`, `pages/`, `components/PlanCard.jsx`, `PlanGrid.jsx`, `AreaCard.jsx`, `ServicePage.jsx`.

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "Documenta tarifas, rutas y comandos de verificación"
```

---

## Verificación final

Antes de dar el trabajo por terminado, ejecutar `npm run check` y comprobar los siete criterios del spec:

1. Build sin errores y tres rutas prerenderizadas con contenido real.
2. axe-core sin violaciones en las tres rutas.
3. Sin scroll horizontal a 320, 375, 768, 1024 y 1440 px.
4. Consola sin errores ni avisos de hidratación.
5. Hash de cada `index.html` coincidente en `sw.js`.
6. JSON-LD de cada ruta parseando con los importes correctos.
7. Navegación completa con teclado.
