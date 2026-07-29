// Optimiza las fotos de public/uploads para la web.
//
// Las fotos que llegan del móvil o de la cámara vienen a 4000×6000 y 13 MB.
// Servir eso a un visitante con datos móviles es inaceptable: la web entera
// pesa menos que una sola de esas fotos. Este script las reduce al ancho que
// realmente usa el diseño y guarda el original intacto en `_originales/`.
//
//   node scripts/optimize-uploads.mjs          # optimiza lo que haga falta
//   node scripts/optimize-uploads.mjs --dry    # solo informa, no toca nada
//
// `_originales/` está en .gitignore: no se publica ni se versiona.

import { mkdirSync, readdirSync, renameSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const UPLOADS = join(ROOT, 'public', 'uploads')
const ORIGINALS = join(ROOT, '_originales')

// El diseño nunca muestra estas fotos a más de ~700 px de ancho real, ni
// siquiera en pantallas grandes. 1080 deja margen para pantallas de alta
// densidad sin disparar el peso, y es el ancho de las fotos ya existentes.
const MAX_WIDTH = 1080
const QUALITY = 82

// Umbral de peso por encima del cual merece la pena reprocesar. Una foto que
// ya pesa poco NO se toca aunque sea ancha: el logotipo de la portada mide
// 1408 px pero ocupa 62 KB, y reducirlo solo empeoraría su nitidez en
// pantallas grandes (además de desajustar el width/height que declara el HTML).
const MAX_BYTES = 900 * 1024

// Salvo que la imagen sea desproporcionadamente grande en píxeles, en cuyo
// caso sí conviene reducirla aunque comprima bien.
const ABSURD_WIDTH = 2000

const dry = process.argv.includes('--dry')
const kb = (bytes) => `${Math.round(bytes / 1024)} KB`

const candidates = readdirSync(UPLOADS).filter((name) => /\.(jpe?g|png)$/i.test(name))

let touched = 0

for (const name of candidates) {
  const file = join(UPLOADS, name)
  const before = statSync(file).size
  const { width, height } = await sharp(file).metadata()

  if (before <= MAX_BYTES && width <= ABSURD_WIDTH) continue

  const targetHeight = Math.round((height / width) * MAX_WIDTH)
  console.log(
    `${name}: ${width}×${height} ${kb(before)} → ${MAX_WIDTH}×${targetHeight}`,
  )

  if (dry) {
    touched += 1
    continue
  }

  // Reducimos a un buffer ANTES de mover el original: si sharp fallara, el
  // fichero de partida sigue en su sitio y no perdemos nada.
  const optimized = await sharp(file)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toBuffer()

  mkdirSync(ORIGINALS, { recursive: true })
  renameSync(file, join(ORIGINALS, name))
  await sharp(optimized).toFile(file)

  const after = statSync(file).size
  console.log(
    `  ${kb(before)} → ${kb(after)}  (−${Math.round((1 - after / before) * 100)} %), original en _originales/${name}`,
  )
  touched += 1
}

console.log(
  touched === 0
    ? 'Nada que optimizar: todas las fotos están dentro de los límites.'
    : `${touched} foto(s) ${dry ? 'necesitan optimizarse' : 'optimizadas'}.`,
)
