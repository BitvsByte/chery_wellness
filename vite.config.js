import { existsSync, writeFileSync } from 'node:fs'
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
} from './src/data/seo.js'

const ROOT = dirname(fileURLToPath(import.meta.url))
const SSR_ENTRY = resolve(ROOT, 'dist-ssr/entry-server.js')

/**
 * Inyecta en `index.html` la canónica, las tarjetas sociales y el JSON-LD, y
 * en build incrusta el HTML ya renderizado dentro de `#root`.
 *
 * El prerender ocurre en `transformIndexHtml`, es decir, ANTES de que
 * vite-plugin-pwa calcule el manifiesto de precache. Si se hiciera después,
 * el hash de `index.html` en `sw.js` quedaría desincronizado.
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

        // Sólo prerenderizamos en build. En `npm run dev` el bundle de
        // `dist-ssr/` puede existir de un build anterior y estaría obsoleto
        // respecto al código en edición, así que se sirve la SPA normal.
        if (!isBuild || !existsSync(SSR_ENTRY)) return { html, tags }

        const { render } = await import(pathToFileURL(SSR_ENTRY).href)
        return {
          html: html.replace(
            '<div id="root"></div>',
            `<div id="root">${render()}</div>`,
          ),
          tags,
        }
      },
    },

    closeBundle() {
      const lastmod = new Date().toISOString().slice(0, 10)
      writeFileSync(resolve(ROOT, 'dist/sitemap.xml'), buildSitemap(lastmod))
      writeFileSync(resolve(ROOT, 'dist/robots.txt'), buildRobots())
      this.info(`sitemap.xml y robots.txt generados para ${SITE.url}`)
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
            },
          }),
        ]),
  ],
}))
