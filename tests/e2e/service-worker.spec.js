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

for (const { path, h1 } of SERVICE_ROUTES) {
  test(`${path} hidrata sin errores en una carga completa tras registrar el service worker en la home`, async ({
    page,
  }) => {
    const problems = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') problems.push(msg.text())
    })
    page.on('pageerror', (error) => problems.push(String(error)))

    await page.goto('/')
    // `clientsClaim()` hace que el SW recién activado tome el control de
    // esta misma pestaña sin recargar: esperamos a que `controller` deje
    // de ser null, que es la señal de que ya está interceptando fetches.
    await page.waitForFunction(() => navigator.serviceWorker?.controller != null, null, {
      timeout: 15_000,
    })

    problems.length = 0
    await page.goto(path)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toHaveText(h1)
    expect(problems).toEqual([])
  })
}
