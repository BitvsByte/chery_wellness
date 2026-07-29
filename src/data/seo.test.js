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

  it('no repite el marcado de preguntas frecuentes entre home y páginas de servicio', () => {
    const homeTypes = buildJsonLd('home')['@graph'].map((n) => n['@type'])
    expect(homeTypes).not.toContain('FAQPage')

    const trainingFaq = buildJsonLd('training')['@graph'].find((n) => n['@type'] === 'FAQPage')
    expect(trainingFaq.mainEntity.length).toBeGreaterThan(0)

    const posingFaq = buildJsonLd('posing')['@graph'].find((n) => n['@type'] === 'FAQPage')
    expect(posingFaq.mainEntity.length).toBeGreaterThan(0)
  })

  it('anuncia en la home solo las dos áreas que muestra', () => {
    const business = buildJsonLd('home')['@graph'].find((n) => n['@type'] === 'ProfessionalService')
    expect(business.hasOfferCatalog.itemListElement.map((o) => o.itemOffered.name)).toEqual([
      'Entrenamiento y Dietas',
      'Posing',
    ])
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
