import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import {
  SITE,
  buildJsonLd,
  buildMetaTags,
  buildRobots,
  buildSitemap,
  renderHead,
} from './src/data/seo.js'
import { ROUTES } from './src/data/plans.js'
import { buildNavigateFallbackDenylist, buildRouteAliasEntries } from './src/utils/sw-routes.js'

const ROOT = dirname(fileURLToPath(import.meta.url))
const SSR_ENTRY = resolve(ROOT, 'dist-ssr/entry-server.js')
const DIST_DIR = resolve(ROOT, 'dist')

// `VitePWA` registra por defecto un `NavigationRoute` sin allowlist ni
// denylist, que en `generateSW` intercepta TODA navegación y responde con
// `index.html` (la home) desde el precache — también para
// `/entrenamiento-y-dietas` y `/posing`. Con el service worker activo, una
// carga completa de página a cualquiera de las otras rutas recibía el
// marcado de la home, y React fallaba al hidratar sobre él (visible un
// instante como el contenido de la home antes de que React lo reemplazara).
//
// Las tres rutas de `ROUTES` ya están precacheadas cada una con su propio
// HTML (ver `closeBundle` más abajo), así que no necesitan el fallback
// genérico: basta con excluirlas de él para que cada una resuelva con su
// propio HTML. Los patrones se derivan de `ROUTES` en `src/utils/sw-routes.js`
// (probado en `sw-routes.test.js`) para que una ruta nueva no vuelva a romper
// esto en silencio.
const NAVIGATE_FALLBACK_DENYLIST = buildNavigateFallbackDenylist(ROUTES)

// Marcador que deja `transformIndexHtml` en build, para que `closeBundle` lo
// sustituya por el <head> de cada ruta una vez conoce el HTML final con las
// etiquetas de assets.
const SEO_SLOT = '<!--CHERY_SEO-->'

/**
 * Inyecta en `index.html` la canónica, las tarjetas sociales y el JSON-LD, y
 * en build genera en `closeBundle` el HTML ya renderizado de las tres rutas.
 *
 * El prerender ocurre en `closeBundle`, que corre después de que Vite haya
 * escrito `dist/` y ANTES del `closeBundle` de vite-plugin-pwa, porque este
 * plugin aparece antes en el array de plugins. Por eso workbox calcula los
 * hashes de precache sobre los HTML ya finales.
 */
function seoHtml({ isBuild }) {
  return {
    name: 'chery-seo-html',
    enforce: 'post',

    transformIndexHtml: {
      order: 'post',
      async handler(html) {
        // Título y descripción viven en `seo.js`, no en index.html, para que
        // no puedan desincronizarse de los valores usados en OG/Twitter/JSON-LD.
        const tags = [
          { tag: 'title', children: SITE.title, injectTo: 'head' },
          {
            tag: 'meta',
            attrs: { name: 'description', content: SITE.description },
            injectTo: 'head',
          },
          ...buildMetaTags().map(({ rel, ...attrs }) =>
            rel
              ? { tag: 'link', attrs: { rel, ...attrs }, injectTo: 'head' }
              : { tag: 'meta', attrs, injectTo: 'head' },
          ),
        ]

        tags.push({
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          // Escapamos `<` para que ningún texto pueda cerrar el <script>.
          children: JSON.stringify(buildJsonLd()).replace(/</g, '\\u003c'),
          injectTo: 'head',
        })

        // En build generamos las tres rutas en closeBundle, donde ya
        // conocemos el HTML final con las etiquetas de assets. Aquí solo
        // dejamos el hueco.
        if (isBuild) {
          return html.replace('</head>', `${SEO_SLOT}\n  </head>`)
        }

        return { html, tags }
      },
    },

    // `closeBundle` corre después de que Vite haya escrito dist/ y ANTES del
    // closeBundle de vite-plugin-pwa, porque este plugin va primero en el
    // array. Por eso workbox calcula los hashes sobre los HTML ya finales.
    //
    // En `npm run dev` este hook no se registra en absoluto (ver más abajo,
    // donde `seoHtml` sólo se añade al array de plugins en build), así que
    // el bundle potencialmente obsoleto de `dist-ssr/` nunca se usa fuera de
    // un build real.
    async closeBundle() {
      // En dev este hook no debería dispararse (closeBundle es de Rollup, no
      // del servidor de dev), pero comprobamos igualmente `isBuild` por si
      // acaso: ahí sí es correcto salir en silencio.
      if (!isBuild) return

      // En build, en cambio, que falte el bundle SSR es un fallo real: si se
      // ejecuta `vite build` sin haber corrido antes `build:ssr` (por
      // ejemplo, un pipeline que separa los pasos), sin esta comprobación el
      // marcador SEO_SLOT quedaría literal en el HTML, `<div id="root">`
      // vacío, y el proceso terminaría con código de salida 0: workbox
      // precachearía ese HTML roto y lo serviría como si fuera válido.
      if (!existsSync(SSR_ENTRY)) {
        this.error(
          `No existe ${SSR_ENTRY}. El build de cliente necesita el bundle SSR: ` +
            'ejecuta `npm run build`, que encadena build:ssr antes de vite build.',
        )
      }

      const distDir = DIST_DIR
      const template = readFileSync(resolve(distDir, 'index.html'), 'utf8')

      if (!template.includes(SEO_SLOT)) {
        this.error('No se encontró el marcador de SEO en dist/index.html')
      }

      const { render } = await import(pathToFileURL(SSR_ENTRY).href)

      for (const [key, route] of Object.entries(ROUTES)) {
        const head = renderHead(key)
        const body = render(route)
        const html = template
          .replace(SEO_SLOT, head)
          .replace('<div id="root"></div>', `<div id="root">${body}</div>`)

        const file =
          route === '/'
            ? resolve(distDir, 'index.html')
            : resolve(distDir, route.replace(/^\//, ''), 'index.html')
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, html)
      }

      const lastmod = new Date().toISOString().slice(0, 10)
      writeFileSync(resolve(distDir, 'sitemap.xml'), buildSitemap(lastmod))
      writeFileSync(resolve(distDir, 'robots.txt'), buildRobots())
      this.info(`Prerenderizadas ${Object.keys(ROUTES).length} rutas`)
    },

    // `vite preview` sirve `dist/` con el middleware de fallback SPA de Vite,
    // que para una ruta sin extensión ni barra final sólo prueba
    // `<ruta>.html` antes de rendirse a `/index.html`. Nuestras rutas son
    // directorios (`dist/entrenamiento-y-dietas/index.html`), así que sin
    // este middleware `npm run preview` serviría la home para
    // `/entrenamiento-y-dietas`, con su canónica y su HTML equivocados: un
    // host de producción con "clean URLs" (Netlify, Vercel, Nginx con
    // try_files) sí resuelve ese directorio, así que replicamos ese
    // comportamiento aquí para que la vista previa coincida con producción.
    //
    // Se registra llamando a `server.middlewares.use` directamente (no
    // devolviendo una función), así que Vite lo instala ANTES que su propio
    // fallback SPA.
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next()
        const pathname = decodeURIComponent((req.url ?? '').split('?')[0])
        if (pathname === '/' || pathname.includes('.') || pathname.endsWith('/')) {
          return next()
        }
        const indexPath = resolve(DIST_DIR, `.${pathname}`, 'index.html')
        if (existsSync(indexPath)) {
          req.url = `${pathname}/index.html`
        }
        next()
      })
    },
  }
}

export default defineConfig(({ command, isSsrBuild }) => ({
  plugins: [
    react(),
    // El build SSR sólo produce el módulo de render: sin HTML, sin PWA.
    ...(isSsrBuild
      ? []
      : [
          seoHtml({ isBuild: command === 'build' }),
          VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['icons/favicon.png', 'icons/apple-touch-icon.png'],
            manifest: {
              name: 'Chery Figueroa Wellness PRO',
              short_name: 'CW Wellness',
              description:
                'Elite coaching de bodybuilding y wellness aesthetics: posing, dietas de competición y entrenamiento con Chery Figueroa, campeona internacional IFBB.',
              lang: 'es',
              dir: 'ltr',
              start_url: '/',
              scope: '/',
              display: 'standalone',
              orientation: 'portrait',
              background_color: '#111213',
              theme_color: '#111213',
              categories: ['fitness', 'health', 'sports'],
              icons: [
                { src: 'icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
                { src: 'icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
                {
                  src: 'icons/pwa-512-maskable.png',
                  sizes: '512x512',
                  type: 'image/png',
                  purpose: 'maskable',
                },
              ],
            },
            workbox: {
              globPatterns: ['**/*.{js,css,html,png,jpeg,jpg,svg,woff2}'],
              maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
              navigateFallback: 'index.html',
              navigateFallbackDenylist: NAVIGATE_FALLBACK_DENYLIST,
              // Sin esto, sin conexión sólo cargaban `/` y `/posing/`: la
              // forma canónica sin barra final (`/posing`) no la encuentra el
              // precache, porque workbox nunca prueba la variante
              // `<ruta>/index.html` para una URL que no acaba en barra. Ver
              // `buildRouteAliasEntries` en `src/utils/sw-routes.js`.
              manifestTransforms: [
                (manifest) => ({
                  manifest: [...manifest, ...buildRouteAliasEntries(ROUTES, manifest)],
                }),
              ],
            },
          }),
        ]),
  ],
}))
