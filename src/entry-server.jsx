// Entrada de renderizado en servidor. Se compila con `vite build --ssr` y la
// consume el plugin `seoHtml` de `vite.config.js` para incrustar el HTML ya
// renderizado dentro de `dist/index.html`.
//
// No importa CSS ni fuentes: los estilos los aporta el build de cliente.

import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from './App.jsx'

// `App` monta <Routes>, que exige un Router en el árbol. En cliente lo pone
// `BrowserRouter` (main.jsx); aquí usamos StaticRouter con la ruta que se
// prerenderiza. De momento solo existe la home; la tarea 10 amplía esto para
// prerenderizar también /entrenamiento-y-dietas y /posing.
export function render(url = '/') {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  )
}
