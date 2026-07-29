# Chery Figueroa Wellness PRO

PWA oficial de **Chery Figueroa**, atleta profesional IFBB (Women's Wellness) y
entrenadora personal: elite coaching de posing, dietas de prep y entrenamiento.

## Stack

- **React 18 + Vite 6** — SPA por componentes
- **react-router-dom** — tres rutas: portada y dos páginas de servicio (ver `## Rutas`)
- **Tailwind CSS 3** — design system con tokens de marca (grafito + cromo plateado)
- **vite-plugin-pwa** — instalable y offline: las tres rutas cargan sin conexión
  en su forma canónica (`/`, `/entrenamiento-y-dietas`, `/posing`), y una URL
  desconocida muestra el aviso de «página no encontrada» en vez de un error de
  red (ver `## Service worker`)
- **Fontsource** — Playfair Display y Plus Jakarta Sans autoalojadas (sin CDN externos)
- Sin base de datos: el formulario redacta la solicitud y la abre en WhatsApp o email

## Rutas

La web tiene tres rutas, todas prerenderizadas en el build y listadas en
`sitemap.xml` (se genera solo, no lo edites a mano):

- `/` — portada: hero, áreas, ticker de eventos, Nosotras, testimonios, galería, FAQ y contacto
- `/entrenamiento-y-dietas` — planes de dieta y entrenamiento, con sus FAQ y su formulario
- `/posing` — clases de posing, con sus FAQ y su formulario

Cada ruta tiene su propio `<h1>`, su propia canónica y su propio JSON-LD (ver
`## SEO`); las dos páginas de servicio comparten plantilla (`ServicePage.jsx`).

Cualquier otra URL cae en la ruta comodín y muestra `NotFoundPage.jsx`: un
aviso sobrio con enlaces a las tres rutas, marcado `noindex` para que no se
indexe como soft-404.

## Tarifas

Los precios viven en un único fichero, `src/data/plans.js`: de ahí salen a la
vez las tarjetas de precio (`PlanCard`/`PlanGrid`), las opciones del campo
«Plan que te interesa» del formulario (derivadas en `src/utils/validation.js`)
y los `Offer` del JSON-LD de cada página de servicio (`src/data/seo.js`). Para
cambiar un precio se toca solo ese fichero: los otros dos sitios se
actualizan solos.

Los avisos de "Ahorras X €" no se escriben a mano: `withSavings()` los calcula
comparando cada precio con el de la unidad suelta (o con un importe de
referencia que no se llega a mostrar, como en el bono de 4 clases de posing,
que se compara contra los 60 € de la clase suelta).

## Comandos

```bash
npm install       # instalar dependencias
npm run dev       # desarrollo en http://localhost:5173
npm run build     # build SSR + cliente, con prerender de las tres rutas y SEO, en dist/
npm run preview   # sirve dist/ en http://localhost:4173
npm test          # tests unitarios y de componentes (Vitest)
npm run test:e2e  # axe-core, anchos, destinos táctiles, service worker y carga sin conexión (Playwright)
npm run check     # verificación completa antes de desplegar: test + build + precache + test:e2e
```

`npm run build` son dos pasos encadenados: primero `build:ssr` compila
`src/entry-server.jsx` en `dist-ssr/`, y después el build de cliente usa ese
módulo para prerenderizar las tres rutas (`/`, `/entrenamiento-y-dietas` y
`/posing`) e incrustar cada HTML ya renderizado en su propio
`dist/<ruta>/index.html`. Ese orden es obligatorio: si se prerenderizara
después, el hash de cada `index.html` en `sw.js` quedaría desincronizado y el
service worker serviría una versión obsoleta. Si falta el bundle SSR — por
ejemplo, un pipeline que ejecuta `vite build` sin `build:ssr` antes — el build
aborta con error en vez de publicar en silencio un HTML roto con un
`<div id="root">` vacío.

`npm run check` es la verificación completa antes de desplegar: encadena los
tests unitarios, el build, `scripts/check-precache.mjs` (que comprueba que el
hash de cada `index.html` coincide con el precache de `sw.js` y que cada ruta
de servicio está precacheada también en su forma sin barra final) y la suite
de Playwright, que en las tres rutas comprueba axe-core sin violaciones,
ausencia de scroll horizontal en cinco anchos (320 a 1440 px), destinos
táctiles suficientes y ausencia de avisos de hidratación en consola. Sobre el
service worker comprueba además, con el SW ya controlando la pestaña, que
cada ruta de servicio recibe su propio documento — también cuando la URL
llega con `?igshid=`, `?fbclid=` o UTM, como reparten Instagram, Facebook y
las campañas — y que las tres rutas canónicas cargan con la red cortada
(`context.setOffline(true)`, en `tests/e2e/offline.spec.js`).

## Service worker

Tres detalles del `generateSW` de workbox que conviene no perder de vista; los
patrones se derivan de `ROUTES` en `src/utils/sw-routes.js` y están probados
en `src/utils/sw-routes.test.js`:

- **La denylist del `NavigationRoute` se compara contra `pathname + search`**,
  no contra el pathname solo. Un patrón anclado al final (`^/posing/?$`) deja
  fuera del fallback a `/posing` pero no a `/posing?igshid=…`, que acababa
  recibiendo el HTML de la portada. Por eso los patrones terminan en
  `(/|\?|$)`.
- **La portada NO va en la denylist**: su fallback es `index.html`, que es su
  propio documento. Dejarla dentro del fallback es además lo que permite que
  una URL desconocida pinte el aviso de «página no encontrada» sin conexión.
- **El precache no encuentra `/posing` por sí solo**: guarda
  `posing/index.html`, y para una URL sin barra final workbox sólo prueba
  `/posing` y `/posing.html`. Se añade una entrada de precache por ruta con la
  forma sin barra y la misma revisión que su HTML (`buildRouteAliasEntries`),
  que es la forma canónica del sitemap, del menú y de Cloudflare Pages.

## SEO

Todo lo que depende del dominio vive en `src/data/seo.js` (constante `SITE` y
las funciones `buildJsonLd`, `buildMetaTags`, `buildSitemap`, `renderHead`), y
el plugin `chery-seo-html` de `vite.config.js` lo inyecta en el build, una vez
por cada una de las tres rutas:

- `<title>` y meta description propios de cada ruta — **no** los dupliques en `index.html`
- `<link rel="canonical">` propio de cada ruta y `<meta name="robots">`
- Open Graph + Twitter Cards (`summary_large_image`)
- JSON-LD por ruta: la portada publica `WebSite`, `Person`, `ProfessionalService`
  (con el catálogo de las dos áreas) y `WebPage`; cada página de servicio
  publica `Service` con sus `Offer` (precio y moneda, tomados de
  `src/data/plans.js`) y un `BreadcrumbList`
- El bloque `FAQPage` se marca solo en las páginas de servicio
  (`/entrenamiento-y-dietas` y `/posing`), nunca en la portada: marcar las
  mismas preguntas en dos URLs es marcado duplicado
- `sitemap.xml` (las tres rutas) y `robots.txt` generados en `dist/` (no los
  edites a mano)
- HTML prerenderizado por ruta: el crawler recibe la página completa, no un
  `<div>` vacío
- `DocumentHead.jsx` mantiene `<title>`, canónica y `robots` al día en las
  navegaciones internas (leyendo `PAGES`, sin duplicar los textos): sin él sólo
  las cargas completas recibían el `<head>` correcto, y la pestaña, los
  marcadores y la analítica se quedaban con los de la portada

Pendiente: al confirmar la ciudad, sustituir `areaServed` por `address` + `geo`
y elevar `ProfessionalService` a `LocalBusiness` para optar al pack local.

## Estructura

```
src/
├── data/content.js        # textos, testimonios, FAQ, contacto, enlaces de nav
├── data/plans.js          # tarifas: fuente única de tarjetas, formulario y JSON-LD
├── data/seo.js            # dominio canónico, metaetiquetas, JSON-LD y sitemap por ruta
├── entry-server.jsx       # render SSR usado para prerenderizar las tres rutas
├── App.jsx                # <Routes> de las tres páginas + skip-link, Header, Footer
├── main.jsx                # arranque cliente: BrowserRouter + hidratación
├── utils/validation.js    # patrones de lista blanca + saneado del formulario
├── utils/format.js         # formatEuro, compartido por servidor y cliente
├── utils/sw-routes.js      # denylist y alias de precache del service worker, derivados de ROUTES
├── pages/
│   ├── Home.jsx             # portada: Hero, Areas, ticker, Nosotras, testimonios, galería, FAQ, contacto
│   ├── TrainingPage.jsx     # /entrenamiento-y-dietas
│   ├── PosingPage.jsx       # /posing
│   └── NotFoundPage.jsx     # ruta comodín: aviso sobrio + enlaces, noindex
├── components/
│   ├── ui/                # primitivas: ChromeHeading, Field, Icons, SectionDivider
│   ├── Header.jsx         # nav sticky + menú móvil accesible
│   ├── Hero.jsx            # logo escudo CW como foco de marca
│   ├── Areas.jsx            # las dos áreas en la home, cada una enlazando a su ruta
│   ├── AreaCard.jsx         # tarjeta de área con precio "desde"
│   ├── PlanGrid.jsx         # rejilla de PlanCard de una página de servicio
│   ├── PlanCard.jsx         # tarjeta de un plan con su escalera de precios
│   ├── ServicePage.jsx      # plantilla común de las dos páginas de servicio
│   ├── DocumentHead.jsx     # título, canónica y robots por ruta en navegación cliente
│   ├── ScrollToHash.jsx     # repone el scroll a ancla o arriba, y mueve el foco, al cambiar de ruta
│   ├── EventsTicker.jsx   # cinta de eventos pausable (WCAG 2.2.2)
│   ├── About.jsx          # Nosotras + pedestal de tarima
│   ├── Testimonials.jsx   # testimonios de atletas
│   ├── Gallery.jsx        # galería de competición + redes
│   ├── Faq.jsx             # acordeón accesible de la home (aria-expanded/controls)
│   ├── Contact.jsx        # sección de contacto
│   ├── ContactForm.jsx    # formulario validado y endurecido
│   └── Footer.jsx
└── index.css              # tokens, efecto cromo, botones metálicos, focus
```

## Seguridad del formulario

Aunque hoy no hay backend, cada campo está preparado contra inyección:

- `pattern` HTML de **lista blanca** por campo (letras/espacios en nombre,
  formato estricto de email y teléfono, etc.) + `maxLength`
- Revalidación en JS con los mismos patrones (`src/utils/validation.js`)
- Selects verificados contra su lista de opciones (no se confía en el DOM)
- Texto libre: bloqueo de caracteres peligrosos (`< > { } [ ] \` \\ | ~ ^`) y de
  secuencias SQL típicas (`--`, `/* */`, `UNION SELECT`, `OR 1=1`…)
- Saneado de caracteres de control + honeypot anti-bots
- Cuando exista backend, la defensa definitiva serán consultas parametrizadas;
  esta capa impide que un payload llegue siquiera a salir del cliente

## Accesibilidad

`npm run check` pasa axe-core (`@axe-core/playwright`, reglas WCAG 2.0/2.1 A y
AA) sin violaciones en las tres rutas — ver `tests/e2e/a11y.spec.js`.

- Labels visibles en todos los campos; errores con `aria-invalid`,
  `aria-describedby`, `role="alert"` y foco al primer campo inválido
- Skip-link, landmarks semánticos, un único `<h1>` por ruta y jerarquía de
  encabezados correcta
- Al cambiar de ruta el foco pasa al `<h1>` de la página nueva (o al destino
  del ancla), para que el lector de pantalla anuncie una navegación que no
  recarga el documento; con `preventScroll`, sin tocar el desplazamiento ni el
  respeto a `prefers-reduced-motion`
- Acordeón FAQ y menú móvil con `aria-expanded`/`aria-controls`; el menú móvil
  se cierra con Escape y devuelve el foco al botón que lo abrió
- Cinta de eventos con botón de pausa y `prefers-reduced-motion` respetado
- Foco visible en todos los elementos interactivos; contraste AA/AAA
- Alt descriptivo en todas las imágenes; iconos decorativos con `aria-hidden`
- Destinos táctiles comprobados en cinco anchos (320 a 1440 px): botones y
  llamadas a la acción (`.btn-chrome`, `.btn-ghost`) a 44 px mínimo (WCAG
  2.5.5 AAA), enlaces de navegación a 24 px (WCAG 2.5.8 AA)
- Cifras de precio con `font-variant-numeric: tabular-nums` (clase `.nums`
  en `src/index.css`) para que las columnas de importes no bailen
- Márgenes seguros con `env(safe-area-inset-*)` (clase `.safe-x`) para
  respetar la muesca en móviles apaisados

## Marca

Los tokens viven en `tailwind.config.js` y `src/index.css`: fondo grafito
(`#111213`), paneles con luz cenital y **cromo plateado** como único acento
(efecto metálico en titulares `.text-chrome` y botones `.btn-chrome`), fiel al
logo del escudo CW y a los mockups de `uploads/` del proyecto original.
