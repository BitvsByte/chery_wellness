// Verifica que el hash de cada HTML en sw.js coincide con el fichero en disco.
// Si no coinciden, el service worker sirve una versión obsoleta de la página.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const PAGES = ['index.html', 'entrenamiento-y-dietas/index.html', 'posing/index.html']
const sw = readFileSync('dist/sw.js', 'utf8')
let failed = false

for (const page of PAGES) {
  const md5 = createHash('md5').update(readFileSync(`dist/${page}`)).digest('hex')
  if (!sw.includes(md5)) {
    console.error(`✗ ${page}: el hash ${md5} no aparece en sw.js`)
    failed = true
  } else {
    console.log(`✓ ${page}`)
  }
}

process.exit(failed ? 1 : 0)
