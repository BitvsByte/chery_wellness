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

// I4: sin ruta comodín, `/precios` devolvía 200 con `#contenido` vacío y el
// <head> de la portada: página en blanco y soft-404 indexable.
test('una URL desconocida muestra el aviso, no una página en blanco', async ({ page }) => {
  await page.goto('/precios')
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('h1')).toHaveText('Página no encontrada')
  await expect(page.locator('main#contenido a')).toHaveCount(3)
  expect(await page.locator('meta[name=robots]').getAttribute('content')).toContain('noindex')
  expect(await page.locator('link[rel=canonical]').getAttribute('href')).toBeNull()
})

test('axe no reporta violaciones en una URL desconocida', async ({ page }) => {
  await page.goto('/precios')
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  expect(violations.map((v) => `${v.id}: ${v.nodes.length} nodo(s)`)).toEqual([])
})

// I5: al navegar por dentro cambiaban la URL y el h1, pero el título y la
// canónica seguían siendo los de la portada toda la sesión.
test('el título y la canónica se actualizan al navegar por dentro', async ({ page }) => {
  await page.goto('/')
  const homeTitle = await page.title()

  await page.getByRole('link', { name: 'Posing', exact: true }).first().click()
  await expect(page).toHaveURL('/posing')

  await expect(page).toHaveTitle(/Posing/)
  expect(await page.title()).not.toBe(homeTitle)
  expect(await page.locator('link[rel=canonical]').getAttribute('href')).toBe(
    'https://cherywellnesspro.com/posing',
  )
})

// I6: el CTA apuntaba siempre a `/#contacto` y expulsaba de la página al
// visitante, perdiendo el plan que acababa de mirar.
test('el CTA de la cabecera lleva al formulario de la propia página de servicio', async ({
  page,
}) => {
  await page.goto('/posing')
  await page.getByRole('link', { name: 'Solicitar consulta' }).first().click()
  await expect(page).toHaveURL('/posing#solicitar')
  await expect(page.locator('h1')).toHaveText('Posing')
})

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
