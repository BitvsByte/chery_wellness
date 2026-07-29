// Entrada de renderizado en servidor. Se compila con `vite build --ssr` y la
// consume el plugin `seoHtml` de `vite.config.js` para incrustar el HTML ya
// renderizado dentro de `dist/index.html`.
//
// No importa CSS ni fuentes: los estilos los aporta el build de cliente.

import { renderToString } from 'react-dom/server'
import App from './App.jsx'

export function render() {
  return renderToString(<App />)
}
