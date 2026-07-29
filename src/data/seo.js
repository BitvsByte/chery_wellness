// Capa SEO: identidad del sitio, metaetiquetas sociales y JSON-LD.
// Se consume en tiempo de build desde `vite.config.js` (plugin `seoHtml`),
// por lo que nada de esto llega al bundle del cliente.

import { CONTACT, CONTACT_LINKS, FAQS, SERVICES } from './content.js'

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

export function buildJsonLd() {
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
        serviceType: SERVICES.map((service) => service.title),
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Servicios de coaching',
          itemListElement: SERVICES.map((service) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: service.title,
              description: service.desc,
              serviceType: service.tag,
              provider: { '@id': `${SITE.url}/#business` },
              areaServed: { '@type': 'Country', name: 'España' },
            },
          })),
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE.url}/#faq`,
        inLanguage: SITE.lang,
        mainEntity: FAQS.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      },
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

/** Metaetiquetas de canónica, indexación y tarjetas sociales. */
export function buildMetaTags() {
  return [
    { rel: 'canonical', href: `${SITE.url}/` },
    { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
    { name: 'author', content: ATHLETE.legalName },

    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: SITE.name },
    { property: 'og:locale', content: SITE.locale },
    { property: 'og:url', content: `${SITE.url}/` },
    { property: 'og:title', content: SITE.title },
    { property: 'og:description', content: SITE.description },
    { property: 'og:image', content: abs(SITE.ogImage) },
    { property: 'og:image:width', content: String(SITE.ogImageWidth) },
    { property: 'og:image:height', content: String(SITE.ogImageHeight) },
    { property: 'og:image:alt', content: SITE.ogImageAlt },

    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: SITE.title },
    { name: 'twitter:description', content: SITE.description },
    { name: 'twitter:image', content: abs(SITE.ogImage) },
    { name: 'twitter:image:alt', content: SITE.ogImageAlt },
  ]
}

export function buildSitemap(lastmod) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE.url}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`
}

export function buildRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE.url}/sitemap.xml
`
}
