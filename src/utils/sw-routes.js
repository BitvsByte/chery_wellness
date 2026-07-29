// Reglas de enrutado del service worker, derivadas de `ROUTES`.
//
// Vive fuera de `vite.config.js` para poder probarse: los dos fallos que ha
// tenido esta configuración (el ancla final de la denylist y la variante sin
// barra que el precache no encontraba) son puro cálculo de cadenas, y como
// tal se pueden verificar sin levantar un navegador.
//
// Nada de esto llega al bundle del cliente: solo lo importa `vite.config.js`.

/** Escapa los caracteres con significado especial en una expresión regular. */
export const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Denylist del `NavigationRoute` de workbox: las rutas que NO deben caer en
 * `navigateFallback: 'index.html'` porque cada una tiene su propio HTML.
 *
 * OJO con el ancla final: workbox NO compara contra `url.pathname`, sino
 * contra `url.pathname + url.search` (ver `NavigationRoute._match` en
 * workbox-routing). Un patrón `^/posing/?$` deja fuera del fallback a
 * `/posing`, pero no a `/posing?igshid=…` ni a `/posing/?igshid=…`, que son
 * justo las URLs que reparten Instagram y Facebook: esas navegaciones
 * recibían `index.html` (la portada) y React fallaba al hidratar.
 *
 * Por eso el patrón termina en `(/|\?|$)`: cubre la ruta, su forma con barra
 * final y cualquier cadena de consulta, sin tragarse rutas hermanas que
 * empiecen igual (`/posing-avanzado` no casa).
 *
 * La portada queda FUERA: su fallback es `index.html`, que es exactamente su
 * propio documento. Excluirla no arregla nada y sí le quita red de seguridad,
 * porque `/?igshid=…` dejaría de resolverse sin conexión. Además así una URL
 * desconocida sigue cayendo en el fallback y la SPA puede pintar su aviso de
 * «página no encontrada» también sin conexión.
 */
export function buildNavigateFallbackDenylist(routes) {
  return Object.values(routes)
    .filter((route) => route !== '/')
    .map((route) => new RegExp(`^${escapeRegExp(route)}(/|\\?|$)`))
}

/**
 * Entradas extra de precache para la forma canónica SIN barra final de cada
 * ruta de servicio.
 *
 * El precache de workbox guarda `posing/index.html`, y para resolver una
 * navegación prueba las variantes que genera `generateURLVariations`: la URL
 * tal cual, la URL sin los parámetros ignorados, `<url>/index.html` SOLO si
 * la ruta acaba en barra, y `<url>.html`. Nunca prueba
 * `/posing` -> `/posing/index.html`, así que sin conexión `/posing` — la
 * forma que publicamos en el sitemap, la del menú y la que sirve Cloudflare
 * Pages — daba error de navegación mientras `/posing/` sí cargaba.
 *
 * La solución más simple que funciona es declarar esa URL en el manifiesto de
 * precache con la MISMA revisión que su HTML: workbox la cachea en la
 * instalación y a partir de ahí la resuelve como cualquier otro recurso
 * precacheado, sin handler propio ni service worker escrito a mano. Reutilizar
 * la revisión del HTML garantiza además que las dos entradas caduquen a la
 * vez: un cambio en la página invalida ambas.
 */
export function buildRouteAliasEntries(routes, manifest) {
  const aliases = []
  for (const route of Object.values(routes)) {
    // La portada ya se resuelve: `/` acaba en barra, así que workbox prueba
    // `/index.html` por su cuenta.
    if (route === '/') continue
    const url = route.replace(/^\//, '')
    const entry = manifest.find((item) => item.url === `${url}/index.html`)
    if (!entry) {
      throw new Error(
        `No se precacheó ${url}/index.html: la ruta ${route} no puede funcionar sin conexión.`,
      )
    }
    aliases.push({ url, revision: entry.revision })
  }
  return aliases
}
