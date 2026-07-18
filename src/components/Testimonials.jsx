import { TESTIMONIALS } from '../data/content.js'
import ChromeHeading from './ui/ChromeHeading.jsx'

function TestimonialCard({ testimonial }) {
  return (
    <li className="card flex flex-col gap-3 rounded-[14px] p-[18px] transition-colors duration-200 hover:border-[rgba(229,231,235,0.55)]">
      <figure className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-2.5">
          <div
            aria-hidden="true"
            className="flex h-[72px] w-[72px] items-center justify-center rounded-xl border-2 border-[rgba(195,199,205,0.6)] bg-gradient-to-br from-[#3a3d44] to-[#22242a] font-display text-[22px] font-bold text-bright shadow-[0_6px_16px_rgba(0,0,0,0.5)]"
          >
            {testimonial.initials}
          </div>
          <img
            src="/icons/pwa-192.png"
            alt=""
            width="40"
            height="40"
            loading="lazy"
            className="h-10 w-10 rounded-full border border-line/80 object-cover opacity-60"
          />
        </div>
        <figcaption className="flex flex-col gap-0.5">
          <span className="text-[15px] font-bold text-bright">{testimonial.name}</span>
          <span className="text-[11px] tracking-wide text-dim">{testimonial.role}</span>
          <span className="mt-1 text-xs tracking-[0.2em] text-silver">
            <span aria-hidden="true">★★★★★</span>
            <span className="sr-only">Valoración: 5 de 5 estrellas</span>
          </span>
        </figcaption>
        <blockquote className="m-0 flex-1 text-[13px] italic leading-relaxed text-body [text-wrap:pretty]">
          «{testimonial.quote}»
        </blockquote>
      </figure>
    </li>
  )
}

export default function Testimonials() {
  return (
    <section id="testimonios" aria-labelledby="titulo-testimonios" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="panel p-6 sm:p-11">
          <ChromeHeading id="titulo-testimonios" className="mb-10 text-4xl sm:text-5xl">
            Testimonios
          </ChromeHeading>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((testimonial) => (
              <TestimonialCard key={testimonial.name} testimonial={testimonial} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
