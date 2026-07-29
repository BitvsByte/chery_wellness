import { test, expect } from '@playwright/test'

// El README promete «instalable y offline». Lo era sólo para la portada:
// workbox guarda `posing/index.html`, pero para resolver una navegación
// prueba `/posing` y `/posing.html`, nunca `/posing/index.html` — esa
// variante exige barra final. Como además la denylist quitaba el fallback de
// navegación, `/posing` daba ERROR DE NAVEGACION sin conexión mientras
// `/posing/` cargaba.
//
// Se prueba la forma SIN barra porque es la canónica: la del sitemap, la del
// menú y la que sirve Cloudflare Pages.
const ROUTES = [
  { path: '/', h1: /Chery Figueroa Wellness PRO/ },
  { path: '/entrenamiento-y-dietas', h1: 'Entrenamiento y Dietas' },
  { path: '/posing', h1: 'Posing' },
]

test.describe.configure({ mode: 'serial' })

test('las tres rutas canónicas cargan sin conexión', async ({ page, context }) => {
  // Registrar el service worker desde la portada. `controller != null` llega
  // tras la activación, que a su vez va después de la instalación: para
  // entonces el precache ya está completo.
  await page.goto('/')
  await page.waitForFunction(() => navigator.serviceWorker?.controller != null, null, {
    timeout: 15_000,
  })

  await context.setOffline(true)
  try {
    for (const { path, h1 } of ROUTES) {
      await page.goto(path)
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.locator('h1')).toHaveText(h1)
    }
  } finally {
    await context.setOffline(false)
  }
})

test('sin conexión, una URL desconocida muestra el aviso en vez de un error de red', async ({
  page,
  context,
}) => {
  await page.goto('/')
  await page.waitForFunction(() => navigator.serviceWorker?.controller != null, null, {
    timeout: 15_000,
  })

  await context.setOffline(true)
  try {
    await page.goto('/precios')
    await expect(page.locator('h1')).toHaveText('Página no encontrada')
  } finally {
    await context.setOffline(false)
  }
})
