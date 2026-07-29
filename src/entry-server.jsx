// Entrada de renderizado en servidor. Se compila con `vite build --ssr` y la
// consume el plugin `chery-seo-html` de `vite.config.js` para incrustar el
// HTML ya renderizado de cada una de las tres rutas.
//
// No importa CSS ni fuentes: los estilos los aporta el build de cliente.

import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from './App.jsx'

// `App` monta <Routes>, que exige un Router en el árbol. En cliente lo pone
// `BrowserRouter` (main.jsx); aquí usamos StaticRouter con la ruta recibida,
// para poder prerenderizar la home, /entrenamiento-y-dietas y /posing.
export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  )
}
