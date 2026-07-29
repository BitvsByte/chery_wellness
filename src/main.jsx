import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/playfair-display/600.css'
import '@fontsource/playfair-display/700.css'
import '@fontsource/playfair-display/800.css'
import '@fontsource-variable/plus-jakarta-sans'
import './index.css'
import App from './App.jsx'

const container = document.getElementById('root')

const tree = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// En producción el HTML llega prerenderizado, así que hidratamos en lugar de
// volver a pintar. En `npm run dev` el contenedor está vacío y montamos normal.
if (container.hasChildNodes()) {
  ReactDOM.hydrateRoot(container, tree)
} else {
  ReactDOM.createRoot(container).render(tree)
}
