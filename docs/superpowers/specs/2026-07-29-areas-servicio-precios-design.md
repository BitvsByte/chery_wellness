# Áreas de servicio y tarifas — diseño

Fecha: 2026-07-29

## Objetivo

Separar la oferta de Chery en dos áreas con identidad y URL propias, cada una con
sus tarifas publicadas:

1. **Entrenamiento y Dietas** — planes mensuales en dos niveles.
2. **Posing** — clases sueltas y bono, facturadas por clase y no por mes.

Se conserva íntegro el sistema visual actual: grafito `#111213`, acento cromo,
Playfair Display para titulares y Plus Jakarta Sans para texto. No se introduce
ningún color, tipografía ni efecto nuevo.

## Decisiones cerradas

| Decisión | Elegido |
|---|---|
| Estructura | Dos páginas reales, no anclas dentro de la home |
| Layout de tarifas | Una tarjeta por plan, con su escalera de precios dentro |
| Puerta de entrada | Dos tarjetas de área en la home, con precio «desde» |
| Duración de clases de posing | 45 min en ambas modalidades |
| IVA | Incluido en los importes publicados |
| Cobro | Sin pasarela: la solicitud se cierra por WhatsApp o email |
| Verificación | Playwright + axe-core como dependencia de desarrollo |

## Tarifas

### Entrenamiento y Dietas

**Start** — construir base con método.

| Duración | Precio | Ahorro |
|---|---|---|
| 1 mes | 100 € | — |
| 3 meses | 250 € | 50 € |

Incluye: dieta personalizada, plan de entrenamiento, seguimiento y revisión cada
30 días.

**Competición** — para quien va a competir o quiere hacerlo. Es el plan
destacado visualmente (filo cromado encendido).

| Duración | Precio | Ahorro |
|---|---|---|
| 1 mes | 150 € | — |
| 3 meses | 350 € | 100 € |
| 6 meses | 600 € | 300 € |

Incluye todo lo de Start, más: entrenamiento y dieta enfocados a objetivos de
competición, seguimiento diario, análisis de fotos y de entrenos, entrenos
específicos orientados a ganar y acceso a canal premium.

### Posing

| Modalidad | Precio | Duración | Ahorro |
|---|---|---|---|
| 1 clase | 60 € | 45 min | — |
| 4 clases | 200 € | 45 min cada una | 40 € |

Clase suelta: sala privada y correcciones. Bono de 4: sala privada, corrección
de errores y seguimiento continuado sobre los fallos detectados.

Los ahorros se calculan en código a partir del precio unitario. No se escriben a
mano y no pueden quedar desactualizados.

## Arquitectura de rutas

Se añade `react-router-dom` sobre el `App` actual.

| Ruta | Título |
|---|---|
| `/` | Home |
| `/entrenamiento-y-dietas` | Entrenamiento y Dietas |
| `/posing` | Posing |

El prerender existente pasa de una ruta a tres: `entry-server.jsx` envuelve
`App` en `StaticRouter` y el plugin `chery-seo-html` escribe
`dist/index.html`, `dist/entrenamiento-y-dietas/index.html` y
`dist/posing/index.html`. Cada una llega al rastreador como documento completo.

En el menú, «Servicios» se sustituye por dos entradas: **Entrenamiento** y
**Posing**. Se descarta el desplegable: dos enlaces directos enlazan mejor
internamente y evitan el submenú accesible.

## Modelo de datos

Fichero nuevo `src/data/plans.js`. Los precios son datos, no texto:

```js
export const TRAINING = {
  slug: 'entrenamiento-y-dietas',
  tiers: [
    {
      id: 'start',
      name: 'Start',
      tag: 'Empieza con método',
      highlight: false,
      summary: '…',
      prices: [ { months: 1, amount: 100 }, { months: 3, amount: 250 } ],
      features: ['Dieta personalizada', 'Plan de entrenamiento',
                 'Seguimiento', 'Revisión cada 30 días'],
    },
    // competicion…
  ],
}

export const POSING = {
  slug: 'posing',
  packs: [
    { id: 'clase-1', classes: 1, amount: 60, minutes: 45, features: [...] },
    { id: 'bono-4',  classes: 4, amount: 200, minutes: 45, features: [...] },
  ],
}
```

De esta única fuente salen las tarjetas, las opciones del formulario y el
JSON-LD. No pueden contradecirse entre sí.

## Componentes

Todos construidos con las clases existentes `.card`, `.panel`, `.btn-chrome`,
`.btn-ghost` y `.text-chrome`.

| Componente | Responsabilidad |
|---|---|
| `PlanCard` | Una tarjeta de plan: nombre, escalera de precios, incluye, CTA |
| `PlanGrid` | Rejilla de planes, responsable solo de la disposición |
| `AreaCard` | Tarjeta de área en la home, con el «desde» |
| `ServicePage` | Plantilla común de las dos páginas de servicio |

`ServicePage` compone: cabecera del área → `PlanGrid` → qué incluye → FAQ →
formulario de contacto.

Las FAQ de cada página de servicio son un **subconjunto de las cinco preguntas
que ya existen** en `content.js`, repartidas por tema; la home las mantiene
todas. No se inventan preguntas ni respuestas nuevas: cualquier pregunta
adicional específica de posing debe redactarla Chery, porque implica afirmar
hechos sobre su método que no constan en el contenido actual.

## Conversión

Cada página de servicio incluye su propio formulario, reutilizando el
`ContactForm` endurecido actual. Al pulsar «Solicitar plaza» en un plan, la
página desplaza al formulario y **preselecciona ese plan** en un campo nuevo
`plan`, alimentado desde `plans.js`.

No se usan parámetros de URL ni saltos entre páginas: quien acaba de decidirse
no debe ir a otro sitio a escribir. Bajo cada importe, la coletilla «IVA
incluido».

## Contrato de accesibilidad

Requisitos vinculantes para el código nuevo:

- La escalera de precios se marca como `<dl>`: cada duración es `<dt>` y su
  importe el `<dd>` correspondiente.
- Los importes usan `font-variant-numeric: tabular-nums` para que las columnas
  de dígitos queden alineadas.
- El salto al formulario mueve el foco al campo `plan`, cuya etiqueta y valor
  seleccionado anuncia el lector de pantalla al recibirlo. No se añade una
  región `aria-live` para esto: duplicaría el anuncio.
- Jerarquía de encabezados sin saltos en cada ruta: un solo `<h1>` por página.
- Los `scroll-mt-*` se mantienen en cada destino de ancla, por la cabecera
  pegajosa.
- Texto de cuerpo del contenido nuevo a 15–16 px en móvil. Las etiquetas en
  versalitas quedan como acento, no como texto corrido.
- Todo destino interactivo conserva 44 × 44 px mínimo.
- Contraste mínimo AA (4.5:1) en todo texto nuevo, verificado numéricamente.

Correcciones de accesibilidad incluidas en este trabajo, detectadas al auditar
el código actual:

- `Header.jsx` — el menú móvil se cierra con `Escape` y devuelve el foco al
  botón que lo abrió.
- `index.css` — se añaden `env(safe-area-inset-*)` en cabecera y pie para
  dispositivos con muesca en horizontal.
- Se refuerza el halo de foco de `.input-base`, hoy a `rgba(156,163,175,0.25)`.
- `translate="no"` en los identificadores de marca y categoría (`IFBB`,
  `Wellness PRO`, `CW`) para que el traductor automático no los altere.

## SEO

`seo.js` pasa de describir un sitio a describir tres rutas. Cada una con título,
descripción y canónica propias, y su JSON-LD:

- `/entrenamiento-y-dietas` y `/posing` publican `Service` con `Offer` real:
  `price`, `priceCurrency: "EUR"` y `availability`. Es lo que permite que el
  precio aparezca en el propio resultado de búsqueda.
- Cada página de servicio lleva su `FAQPage` con sus preguntas propias.
- `BreadcrumbList` en las dos páginas de servicio.
- `sitemap.xml` pasa a listar las tres URLs.

Los importes se formatean con `Intl.NumberFormat('es-ES', …)` en un único
ayudante compartido por servidor y cliente.

## Riesgos

**Desajuste de hidratación en los precios.** `Intl.NumberFormat` puede emitir un
espacio distinto (fino o duro) en Node y en el navegador, lo que provoca un
repintado y un aviso en consola. Mitigación: el ayudante fija explícitamente
`minimumFractionDigits: 0` y el script de verificación compara la cadena
prerenderizada con la del cliente y falla si difieren.

**Crecimiento del precache.** Tres rutas prerenderizadas amplían el manifiesto
del service worker. Debe seguir cumpliéndose que el hash de cada HTML en `sw.js`
coincida con el fichero final, igual que hoy.

## Verificación — criterios de aceptación

El trabajo no se da por terminado hasta que todo esto pase:

1. `npm run build` termina sin errores y las tres rutas generan su HTML
   prerenderizado con contenido real, no un contenedor vacío.
2. axe-core no reporta ninguna violación en las tres rutas.
3. Sin scroll horizontal a 320, 375, 768, 1024 y 1440 px de ancho.
4. Consola sin errores ni avisos de hidratación al cargar cada ruta.
5. El hash de cada `index.html` en `sw.js` coincide con el fichero en disco.
6. El JSON-LD de cada ruta parsea y contiene los importes correctos.
7. Navegación completa con teclado: menú, planes, formulario y FAQ.

La verificación se automatiza en `npm run check` con Playwright y axe-core, de
modo que sea repetible y no dependa de una inspección manual.

## Fuera de alcance

Sin pasarela de pago, sin comparador interactivo, sin selector de duración, sin
CMS. No se modifican hero, Nosotras, galería ni testimonios, ni el acabado
visual existente. El encargo es añadir dos áreas con sus tarifas, no rediseñar
la web.
