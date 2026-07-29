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
