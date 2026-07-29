import { useRef, useState } from 'react'
import ChromeHeading from './ui/ChromeHeading.jsx'
import PlanGrid from './PlanGrid.jsx'
import ContactForm from './ContactForm.jsx'
import SectionDivider from './ui/SectionDivider.jsx'

/**
 * Plantilla de las dos páginas de servicio.
 *
 * Al elegir un plan, el foco salta al campo «Plan» del formulario de esta
 * misma página, ya relleno: quien acaba de decidirse no debe ir a otro sitio
 * a escribir.
 */
export default function ServicePage({ area, plans, faqs, intro }) {
  const [preset, setPreset] = useState('')
  const formRef = useRef(null)

  const select = (planId, priceLabel) => {
    const plan = plans.find((p) => p.id === planId)
    const label = area.packs ? `Posing · ${priceLabel}` : `${plan.name} · ${priceLabel}`
    setPreset(label)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // El campo existe tras el re-render provocado por setPreset.
    requestAnimationFrame(() => document.getElementById('plan')?.focus())
  }

  return (
    <>
      <section aria-labelledby="titulo-area" className="scroll-mt-24">
        <div className="safe-x mx-auto max-w-6xl pt-10 sm:px-6">
          <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-steel">
            {area.tag}
          </p>
          {/* Cada ruta necesita su propio h1: el de la home vive en Hero. */}
          <ChromeHeading
            as="h1"
            id="titulo-area"
            className="mb-4 mt-2 text-4xl sm:text-5xl lg:text-[58px]"
          >
            {area.name}
          </ChromeHeading>
          <p className="mx-auto mb-10 max-w-2xl text-center text-[15px] leading-relaxed text-body [text-wrap:pretty]">
            {intro}
          </p>
          <PlanGrid plans={plans} onSelect={select} />
        </div>
      </section>

      {faqs.length > 0 && (
        <>
          <SectionDivider />
          <section aria-labelledby="titulo-faq-servicio" className="scroll-mt-24">
            <div className="safe-x mx-auto max-w-6xl sm:px-6">
              <div className="panel p-6 sm:p-11">
                <ChromeHeading
                  id="titulo-faq-servicio"
                  className="mb-9 text-3xl sm:text-4xl"
                >
                  Preguntas frecuentes
                </ChromeHeading>
                <dl className="mx-auto flex max-w-3xl flex-col gap-5">
                  {faqs.map((faq) => (
                    <div key={faq.q} className="card rounded-xl p-6">
                      <dt className="text-[15px] font-semibold text-bright">{faq.q}</dt>
                      <dd className="mt-2 text-[15px] leading-[1.75] text-body [text-wrap:pretty]">
                        {faq.a}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>
        </>
      )}

      <SectionDivider />

      <section id="solicitar" ref={formRef} aria-labelledby="titulo-solicitar" className="scroll-mt-24">
        <div className="safe-x mx-auto max-w-6xl pb-6 sm:px-6">
          <div className="panel p-6 sm:p-11">
            <ChromeHeading id="titulo-solicitar" className="mb-3 text-4xl sm:text-5xl">
              Solicitar plaza
            </ChromeHeading>
            <p className="mx-auto mb-9 max-w-lg text-center text-[15px] leading-relaxed text-dim [text-wrap:pretty]">
              Las plazas del equipo son limitadas. Chery revisa personalmente cada solicitud.
            </p>
            <ContactForm key={preset} presetPlan={preset} />
          </div>
        </div>
      </section>
    </>
  )
}
