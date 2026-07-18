# Chery Figueroa Wellness PRO

PWA oficial de **Chery Figueroa**, atleta profesional IFBB (Women's Wellness) y
entrenadora personal: elite coaching de posing, dietas de prep y entrenamiento.

## Stack

- **React 18 + Vite 6** — SPA por componentes
- **Tailwind CSS 3** — design system con tokens de marca (grafito + cromo plateado)
- **vite-plugin-pwa** — instalable y offline (service worker con precache)
- **Fontsource** — Playfair Display y Plus Jakarta Sans autoalojadas (sin CDN externos)
- Sin base de datos: el formulario redacta la solicitud y la abre en WhatsApp o email

## Comandos

```bash
npm install       # instalar dependencias
npm run dev       # desarrollo en http://localhost:5173
npm run build     # build de producción en dist/
npm run preview   # sirve dist/ en http://localhost:4173
```

## Estructura

```
src/
├── data/content.js        # textos, servicios, testimonios, FAQ, contacto
├── utils/validation.js    # patrones de lista blanca + saneado del formulario
├── components/
│   ├── ui/                # primitivas: ChromeHeading, Field, Icons, SectionDivider
│   ├── Header.jsx         # nav sticky + menú móvil accesible
│   ├── Hero.jsx           # logo escudo CW como foco de marca
│   ├── Services.jsx       # tarjetas de servicios
│   ├── EventsTicker.jsx   # cinta de eventos pausable (WCAG 2.2.2)
│   ├── About.jsx          # Nosotras + pedestal de tarima
│   ├── Testimonials.jsx   # testimonios de atletas
│   ├── Gallery.jsx        # galería de competición + redes
│   ├── Faq.jsx            # acordeón accesible (aria-expanded/controls)
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

Lighthouse 100/100 en Accesibilidad, Best Practices y SEO (escritorio y móvil).

- Labels visibles en todos los campos; errores con `aria-invalid`,
  `aria-describedby`, `role="alert"` y foco al primer campo inválido
- Skip-link, landmarks semánticos y jerarquía de encabezados correcta
- Acordeón FAQ y menú móvil con `aria-expanded`/`aria-controls`
- Cinta de eventos con botón de pausa y `prefers-reduced-motion` respetado
- Foco visible en todos los elementos interactivos; contraste AA/AAA
- Alt descriptivo en todas las imágenes; iconos decorativos con `aria-hidden`

## Marca

Los tokens viven en `tailwind.config.js` y `src/index.css`: fondo grafito
(`#111213`), paneles con luz cenital y **cromo plateado** como único acento
(efecto metálico en titulares `.text-chrome` y botones `.btn-chrome`), fiel al
logo del escudo CW y a los mockups de `uploads/` del proyecto original.
