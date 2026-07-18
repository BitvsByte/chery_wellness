/**
 * Titular con el efecto cromo grabado de la marca.
 * `as` permite elegir el nivel de encabezado sin perder el estilo.
 */
export default function ChromeHeading({ as: Tag = 'h2', id, className = '', children }) {
  return (
    <Tag
      id={id}
      className={`text-chrome text-center font-display font-extrabold uppercase tracking-[0.1em] [text-wrap:balance] ${className}`}
    >
      {children}
    </Tag>
  )
}
