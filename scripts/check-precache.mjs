// Verifica que el hash de cada HTML en sw.js coincide con el fichero en disco.
// Si no coinciden, el service worker sirve una versión obsoleta de la página.
//
// Además comprueba que cada ruta de servicio está precacheada TAMBIÉN en su
// forma canónica sin barra final (`/posing`, no sólo `posing/index.html`).
// Workbox no prueba la variante `<ruta>/index.html` para una URL que no acaba
// en barra, así que sin esa entrada la ruta no carga sin conexión — que es
// justo lo que el README promete.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { ROUTES } from '../src/data/plans.js'

const sw = readFileSync('dist/sw.js', 'utf8')
let failed = false

const fail = (message) => {
  console.error(`✗ ${message}`)
  failed = true
}

for (const route of Object.values(ROUTES)) {
  const page = route === '/' ? 'index.html' : `${route.replace(/^\//, '')}/index.html`
  const md5 = createHash('md5').update(readFileSync(`dist/${page}`)).digest('hex')

  if (!sw.includes(md5)) {
    fail(`${page}: el hash ${md5} no aparece en sw.js`)
  } else {
    console.log(`✓ ${page}`)
  }

  // La portada no necesita alias: `/` acaba en barra y workbox ya prueba
  // `/index.html` por su cuenta.
  if (route === '/') continue

  const alias = route.replace(/^\//, '')
  if (!sw.includes(`{url:"${alias}",revision:"${md5}"}`)) {
    fail(
      `${route}: falta la entrada de precache sin barra final (url "${alias}" con revisión ${md5}); ` +
        'la ruta no cargaría sin conexión',
    )
  } else {
    console.log(`✓ ${route} (precacheada sin barra final)`)
  }
}

process.exit(failed ? 1 : 0)
