import { describe, it, expect } from 'vitest'
import { buildNavigateFallbackDenylist, buildRouteAliasEntries } from './sw-routes.js'
import { ROUTES } from '../data/plans.js'

// Workbox compara la denylist contra `url.pathname + url.search`, no contra
// el pathname solo: por eso estas pruebas incluyen las URLs con parámetros,
// que son las que reparten Instagram (`igshid`), Facebook (`fbclid`) y las
// campañas (UTM) hacia las dos páginas de servicio.
const denylist = buildNavigateFallbackDenylist(ROUTES)
const isDenied = (pathnameAndSearch) => denylist.some((re) => re.test(pathnameAndSearch))

describe('buildNavigateFallbackDenylist', () => {
  it('excluye del fallback las rutas de servicio en su forma canónica', () => {
    expect(isDenied('/posing')).toBe(true)
    expect(isDenied('/entrenamiento-y-dietas')).toBe(true)
  })

  it('excluye también la forma con barra final', () => {
    expect(isDenied('/posing/')).toBe(true)
    expect(isDenied('/entrenamiento-y-dietas/')).toBe(true)
  })

  it('excluye las URLs con parámetros de red social o de campaña', () => {
    expect(isDenied('/posing?igshid=MzRlODBiNWFlZA')).toBe(true)
    expect(isDenied('/posing/?igshid=abc')).toBe(true)
    expect(isDenied('/entrenamiento-y-dietas?fbclid=IwAR0abc')).toBe(true)
    expect(isDenied('/entrenamiento-y-dietas/?utm_source=ig&utm_medium=bio')).toBe(true)
  })

  it('no se traga rutas hermanas que empiezan igual', () => {
    expect(isDenied('/posing-avanzado')).toBe(false)
    expect(isDenied('/entrenamiento-y-dietas-online')).toBe(false)
    expect(isDenied('/precios')).toBe(false)
  })

  // El fallback ES el documento de la portada: negárselo sólo le quitaría
  // red de seguridad sin conexión, y dejaría a las URLs desconocidas sin
  // HTML con el que pintar el aviso de «página no encontrada».
  it('deja la portada dentro del fallback', () => {
    expect(isDenied('/')).toBe(false)
    expect(isDenied('/?igshid=abc')).toBe(false)
    expect(isDenied('/precios')).toBe(false)
  })

  it('deriva un patrón por ruta de servicio de ROUTES, sin escribirlas a mano', () => {
    const servicio = Object.values(ROUTES).filter((route) => route !== '/')
    expect(denylist).toHaveLength(servicio.length)
    for (const route of servicio) expect(isDenied(route)).toBe(true)
  })
})

describe('buildRouteAliasEntries', () => {
  const manifest = [
    { url: 'index.html', revision: 'aaa' },
    { url: 'entrenamiento-y-dietas/index.html', revision: 'bbb' },
    { url: 'posing/index.html', revision: 'ccc' },
    { url: 'assets/app-1234.js', revision: null },
  ]

  it('precachea la forma sin barra de cada ruta de servicio', () => {
    expect(buildRouteAliasEntries(ROUTES, manifest)).toEqual([
      { url: 'entrenamiento-y-dietas', revision: 'bbb' },
      { url: 'posing', revision: 'ccc' },
    ])
  })

  it('reutiliza la revisión del HTML para que ambas entradas caduquen juntas', () => {
    const aliases = buildRouteAliasEntries(ROUTES, manifest)
    for (const alias of aliases) {
      const html = manifest.find((item) => item.url === `${alias.url}/index.html`)
      expect(alias.revision).toBe(html.revision)
    }
  })

  it('no duplica la portada, que workbox ya resuelve por acabar en barra', () => {
    const urls = buildRouteAliasEntries(ROUTES, manifest).map((entry) => entry.url)
    expect(urls).not.toContain('')
    expect(urls).not.toContain('index.html')
  })

  it('falla si el HTML de una ruta no llegó al precache', () => {
    const incompleto = manifest.filter((item) => item.url !== 'posing/index.html')
    expect(() => buildRouteAliasEntries(ROUTES, incompleto)).toThrow(/posing\/index\.html/)
  })
})
