import { SERVICES } from '../data/content.js'

function ServiceCard({ service }) {
  return (
    <article
      id={service.id}
      className="card flex flex-col overflow-hidden rounded-[18px] transition-[border-color,box-shadow] duration-200 hover:border-[rgba(229,231,235,0.55)]"
    >
      <div className="mx-3 mt-3 h-72 overflow-hidden rounded-xl border border-line/80 sm:h-80">
        <img
          src={service.img}
          alt={service.imgAlt}
          width={service.imgWidth}
          height={service.imgHeight}
          loading="lazy"
          className="h-full w-full object-cover"
          style={{ objectPosition: service.imgPos }}
        />
      </div>
      <div className="flex flex-1 flex-col items-center gap-2.5 px-6 pb-7 pt-6 text-center">
        <h3 className="text-chrome font-display text-[22px] font-bold uppercase leading-tight">
          {service.title}
        </h3>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-steel">
          {service.tag}
        </p>
        <p className="flex-1 text-sm leading-relaxed text-body [text-wrap:pretty]">
          {service.desc}
        </p>
        <a href="#contacto" className="btn-chrome mt-2.5">
          {service.cta}
        </a>
      </div>
    </article>
  )
}

export default function Services() {
  return (
    <section id="servicios" aria-labelledby="titulo-servicios" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 pt-11 sm:px-6">
        <h2 id="titulo-servicios" className="sr-only">
          Servicios
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  )
}
