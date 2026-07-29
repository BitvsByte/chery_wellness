import { test, expect } from '@playwright/test'

// Escenario real: quien visita la home registra el service worker (con
// `clientsClaim`, empieza a controlar la pestaña sin recargar). Si luego
// hace una carga COMPLETA de página — no una navegación cliente por
// <Link> — a una ruta de servicio (typeo en la barra, enlace externo,
// recarga al volver otro día...), el service worker intercepta esa
// navegación. Si de vuelve el HTML de la home en vez del de la ruta
// pedida, React intenta hidratar el árbol de esa ruta sobre un marcado
// que no es el suyo: falla la hidratación y, durante un instante, el
// visitante ve el contenido de la home antes de que React lo sustituya.
//
// A diferencia del resto de pruebas de a11y.spec.js (que abren cada ruta
// en un contexto nuevo, sin service worker todavía activo), esta prueba
// reproduce el escenario completo en un único contexto de navegador.
const SERVICE_ROUTES = [
  { path: '/entrenamiento-y-dietas', h1: 'Entrenamiento y Dietas' },
  { path: '/posing', h1: 'Posing' },
]

// Instagram y Facebook añaden `?igshid=` y `?fbclid=` a TODO enlace saliente,
// y las campañas añaden UTM: es el recorrido principal de las dos páginas
// nuevas. Workbox compara la denylist del `NavigationRoute` contra
// `url.pathname + url.search`, así que un patrón anclado al final
// (`^/posing/?$`) dejaba fuera del fallback a `/posing` pero no a
// `/posing?igshid=…`, que sí recibía el HTML de la portada.
const TRACKED = [
  { path: '/posing?igshid=MzRlODBiNWFlZA', h1: 'Posing', canonical: '/posing' },
  { path: '/posing/?igshid=abc', h1: 'Posing', canonical: '/posing' },
  {
    path: '/entrenamiento-y-dietas?fbclid=IwAR0abc',
    h1: 'Entrenamiento y Dietas',
    canonical: '/entrenamiento-y-dietas',
  },
  {
    path: '/entrenamiento-y-dietas?utm_source=instagram&utm_medium=bio',
    h1: 'Entrenamiento y Dietas',
    canonical: '/entrenamiento-y-dietas',
  },
]

/**
 * Registra el service worker desde la portada y espera a que controle la
 * pestaña. `clientsClaim()` hace que el SW recién activado tome el control de
 * esta misma pestaña sin recargar: que `controller` deje de ser null es la
 * señal de que ya está interceptando fetches (y, como la activación va
 * después de la instalación, de que el precache está completo).
 */
async function withServiceWorker(page) {
  await page.goto('/')
  await page.waitForFunction(() => navigator.serviceWorker?.controller != null, null, {
    timeout: 15_000,
  })
}

/**
 * `@id` del nodo `Service` del JSON-LD del documento servido.
 *
 * Es el testigo fiable de QUÉ HTML ha entregado el service worker: el título
 * y la canónica los repone `DocumentHead` en cliente en cuanto React monta,
 * así que mirarlos no distingue «me han servido el documento correcto» de
 * «me han servido la portada y React la ha repintado encima».
 */
function serviceIdOf(page) {
  return page.evaluate(() => {
    const script = document.querySelector('script[type="application/ld+json"]')
    if (!script) return null
    const graph = JSON.parse(script.textContent)['@graph'] ?? []
    return graph.find((node) => node['@type'] === 'Service')?.['@id'] ?? null
  })
}

for (const { path, h1 } of SERVICE_ROUTES) {
  test(`${path} hidrata sin errores en una carga completa tras registrar el service worker en la home`, async ({
    page,
  }) => {
    const problems = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') problems.push(msg.text())
    })
    page.on('pageerror', (error) => problems.push(String(error)))

    await withServiceWorker(page)

    problems.length = 0
    await page.goto(path)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toHaveText(h1)
    expect(problems).toEqual([])
  })
}

for (const { path, h1, canonical } of TRACKED) {
  test(`${path} recibe su propio documento, no el de la portada`, async ({ page }) => {
    const problems = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') problems.push(msg.text())
    })
    page.on('pageerror', (error) => problems.push(String(error)))

    await withServiceWorker(page)

    problems.length = 0
    await page.goto(path)
    await page.waitForLoadState('networkidle')

    // El JSON-LD sólo lo escribe el prerender: si aquí aparece el `Service`
    // de la ruta pedida, el documento entregado es el suyo.
    expect(await serviceIdOf(page)).toBe(`https://cherywellnesspro.com${canonical}#service`)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toHaveText(h1)
    // Una hidratación sobre el marcado de la portada llena la consola de
    // avisos de React.
    expect(problems).toEqual([])
  })
}
