// Capa SEO: identidad del sitio, metaetiquetas sociales y JSON-LD.
// Se consume en tiempo de build desde `vite.config.js` (plugin `seoHtml`),
// por lo que nada de esto llega al bundle del cliente.

import { CONTACT, CONTACT_LINKS, FAQS_TRAINING, FAQS_POSING } from './content.js'
import { ROUTES, TRAINING, POSING } from './plans.js'

export const SITE = {
  // Host canónico. Si prefieres fijar `www` como canónico, cambia esta línea
  // y configura en Cloudflare la redirección 301 del otro host hacia este.
  url: 'https://cherywellnesspro.com',
  name: 'Chery Figueroa Wellness PRO',
  shortName: 'CW Wellness PRO',
  locale: 'es_ES',
  lang: 'es',
  title:
    'Chery Figueroa Wellness PRO — Elite Coaching · Bodybuilding · Wellness',
  description:
    'Elite coaching de bodybuilding y wellness aesthetics: posing de competición, dietas de prep y entrenamiento personalizado con Chery Figueroa, campeona internacional IFBB.',
  ogImage: '/uploads/logo.jpeg',
  ogImageWidth: 1408,
  ogImageHeight: 768,
  ogImageAlt:
    'Escudo metálico CW de Chery Figueroa Wellness PRO: elite coaching, bodybuilding, wellness aesthetics',
}

/** Título, descripción y ruta de cada una de las tres páginas indexables. */
export const PAGES = {
  home: {
    path: ROUTES.home,
    title: SITE.title,
    description: SITE.description,
  },
  training: {
    path: ROUTES.training,
    title: 'Entrenamiento y Dietas — Planes de coaching | Chery Figueroa Wellness PRO',
    description:
      'Planes de dieta y entrenamiento con seguimiento, desde 100 € al mes. Plan Start para construir base y plan Competición para preparar tarima con Chery Figueroa, IFBB Pro.',
  },
  posing: {
    path: ROUTES.posing,
    title: 'Clases de Posing Wellness — Sala privada | Chery Figueroa Wellness PRO',
    description:
      'Clases de posing de competición en sala privada, desde 60 €. Técnica de pose, transiciones y poses reglamentarias Wellness con Chery Figueroa, IFBB Pro.',
  },
}

/** Nombre con el que compite y aparece en los rankings oficiales IFBB/NPC. */
const ATHLETE = {
  name: 'Chery Figueroa',
  legalName: 'Chery Figueroa Calix',
  image: '/uploads/chery_4.jpeg',
  awards: [
    'Campeona absoluta de España IFBB — Women’s Wellness',
    '1.ª clasificada Women’s Wellness hasta 163 cm — IFBB Fitness World Cup 2022',
    '3.ª clasificada — IFBB Empro Classic Pro 2025',
    'Competidora IFBB Pro League — Pittsburgh Pro 2025',
  ],
  knowsAbout: [
    'Posing de competición',
    'Categoría Women’s Wellness IFBB',
    'Preparación de competición (prep)',
    'Nutrición deportiva',
    'Entrenamiento de hipertrofia',
    'Recomposición corporal',
  ],
}

const abs = (path) => (path.startsWith('http') ? path : `${SITE.url}${path}`)

/** Perfiles sociales verificados que consolidan la entidad en el grafo. */
const sameAs = [CONTACT_LINKS.instagram, CONTACT_LINKS.tiktok].filter(Boolean)

/** Grafo de la portada: identidad de marca, negocio y las dos áreas. */
function homeGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE.url}/#website`,
        url: `${SITE.url}/`,
        name: SITE.name,
        description: SITE.description,
        inLanguage: SITE.lang,
        publisher: { '@id': `${SITE.url}/#person` },
      },
      {
        '@type': 'Person',
        '@id': `${SITE.url}/#person`,
        name: ATHLETE.name,
        alternateName: ATHLETE.legalName,
        url: `${SITE.url}/`,
        image: abs(ATHLETE.image),
        jobTitle: [
          'Atleta profesional IFBB — Women’s Wellness',
          'Entrenadora personal y coach de competición',
        ],
        nationality: { '@type': 'Country', name: 'Honduras' },
        homeLocation: { '@type': 'Country', name: 'España' },
        award: ATHLETE.awards,
        knowsAbout: ATHLETE.knowsAbout,
        knowsLanguage: 'es',
        sameAs,
        worksFor: { '@id': `${SITE.url}/#business` },
      },
      {
        '@type': 'ProfessionalService',
        '@id': `${SITE.url}/#business`,
        name: SITE.name,
        description: SITE.description,
        url: `${SITE.url}/`,
        image: abs(SITE.ogImage),
        logo: abs('/icons/pwa-512.png'),
        telephone: CONTACT.phone.replace(/\s/g, ''),
        email: CONTACT.email,
        founder: { '@id': `${SITE.url}/#person` },
        employee: { '@id': `${SITE.url}/#person` },
        sameAs,
        inLanguage: SITE.lang,
        // TODO: al confirmar la ciudad, sustituir `areaServed` por un
        // `address` (PostalAddress) + `geo` y elevar el tipo a LocalBusiness
        // para optar al pack local de Google.
        areaServed: [
          { '@type': 'Country', name: 'España' },
          { '@type': 'AdministrativeArea', name: 'Online / internacional' },
        ],
        availableLanguage: 'es',
        priceRange: '€€',
        serviceType: [TRAINING.name, POSING.name],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Áreas de coaching',
          itemListElement: [TRAINING, POSING].map((area) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: area.name,
              description: area.summary,
              url: `${SITE.url}${area.slug}`,
              provider: { '@id': `${SITE.url}/#business` },
              areaServed: { '@type': 'Country', name: 'España' },
            },
          })),
        },
      },
      // El FAQPage vive solo en las páginas de servicio (ver `serviceGraph`):
      // marcar las mismas preguntas en dos URLs es marcado duplicado.
      {
        '@type': 'WebPage',
        '@id': `${SITE.url}/#webpage`,
        url: `${SITE.url}/`,
        name: SITE.title,
        description: SITE.description,
        inLanguage: SITE.lang,
        isPartOf: { '@id': `${SITE.url}/#website` },
        about: { '@id': `${SITE.url}/#person` },
        primaryImageOfPage: abs(SITE.ogImage),
      },
    ],
  }
}

/**
 * Grafo de una página de servicio (Entrenamiento o Posing): sus preguntas
 * frecuentes propias, el `Service` con las ofertas reales tomadas de
 * `plans.js`, migas de pan y la `WebPage`.
 */
function serviceGraph(area, groups, pageKey, faqs) {
  const page = PAGES[pageKey]
  const url = `${SITE.url}${page.path}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Solo se publica FAQPage si la ruta muestra realmente esas preguntas:
      // marcar preguntas que no están en la página incumple las directrices.
      ...(faqs.length > 0
        ? [
            {
              '@type': 'FAQPage',
              '@id': `${url}#faq`,
              inLanguage: SITE.lang,
              mainEntity: faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.q,
                acceptedAnswer: { '@type': 'Answer', text: faq.a },
              })),
            },
          ]
        : []),
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: area.name,
        description: area.summary,
        url,
        serviceType: area.name,
        provider: { '@id': `${SITE.url}/#business` },
        areaServed: { '@type': 'Country', name: 'España' },
        inLanguage: SITE.lang,
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `Tarifas de ${area.name}`,
          itemListElement: groups.flatMap((group) =>
            group.prices.map((price) => ({
              '@type': 'Offer',
              name: `${group.name} · ${price.label}`,
              description: group.summary,
              price: String(price.amount),
              priceCurrency: 'EUR',
              availability: 'https://schema.org/InStock',
              url,
            })),
          ),
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE.url}/` },
          { '@type': 'ListItem', position: 2, name: area.name, item: url },
        ],
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        inLanguage: SITE.lang,
        isPartOf: { '@id': `${SITE.url}/#website` },
      },
    ],
  }
}

/** JSON-LD de la ruta indicada: portada, entrenamiento o posing. */
export function buildJsonLd(pageKey = 'home') {
  if (pageKey === 'training') return serviceGraph(TRAINING, TRAINING.tiers, pageKey, FAQS_TRAINING)
  if (pageKey === 'posing') return serviceGraph(POSING, POSING.packs, pageKey, FAQS_POSING)
  return homeGraph()
}

/** Metaetiquetas de canónica, indexación y tarjetas sociales de una ruta. */
export function buildMetaTags(pageKey = 'home') {
  const page = PAGES[pageKey]
  const url = `${SITE.url}${page.path}`
  return [
    { rel: 'canonical', href: url },
    { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
    { name: 'author', content: ATHLETE.legalName },

    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: SITE.name },
    { property: 'og:locale', content: SITE.locale },
    { property: 'og:url', content: url },
    { property: 'og:title', content: page.title },
    { property: 'og:description', content: page.description },
    { property: 'og:image', content: abs(SITE.ogImage) },
    { property: 'og:image:width', content: String(SITE.ogImageWidth) },
    { property: 'og:image:height', content: String(SITE.ogImageHeight) },
    { property: 'og:image:alt', content: SITE.ogImageAlt },

    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: page.title },
    { name: 'twitter:description', content: page.description },
    { name: 'twitter:image', content: abs(SITE.ogImage) },
    { name: 'twitter:image:alt', content: SITE.ogImageAlt },
  ]
}

/** Sitemap con las tres rutas indexables. */
export function buildSitemap(lastmod) {
  const urls = Object.values(PAGES)
    .map(
      (page) => `  <url>
    <loc>${SITE.url}${page.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${page.path === '/' ? '1.0' : '0.8'}</priority>
  </url>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

export function buildRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE.url}/sitemap.xml
`
}

/**
 * Devuelve el <head> completo de una ruta, listo para insertar en el HTML.
 * `renderHead` construye el marcado a mano (no hay DOM en tiempo de build),
 * así que escapa `&`, `<` y `"` en cada valor: un título o descripción con
 * comillas dobles podría romper el atributo e inyectar marcado.
 */
export function renderHead(pageKey) {
  const page = PAGES[pageKey]
  const esc = (value) =>
    String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

  const tags = [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}">`,
    ...buildMetaTags(pageKey).map(({ rel, ...attrs }) => {
      const pairs = Object.entries(rel ? { rel, ...attrs } : attrs)
        .map(([k, v]) => `${k}="${esc(v)}"`)
        .join(' ')
      return rel ? `<link ${pairs}>` : `<meta ${pairs}>`
    }),
    `<script type="application/ld+json">${JSON.stringify(buildJsonLd(pageKey)).replace(/</g, '\\u003c')}</script>`,
  ]

  return tags.map((tag) => `    ${tag}`).join('\n')
}
