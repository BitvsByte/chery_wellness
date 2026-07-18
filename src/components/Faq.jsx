import { useState } from 'react'
import { FAQS } from '../data/content.js'
import ChromeHeading from './ui/ChromeHeading.jsx'
import { IconChevronDown } from './ui/Icons.jsx'

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section aria-labelledby="titulo-faq" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="panel p-6 sm:p-11">
          <ChromeHeading id="titulo-faq" className="mb-9 text-3xl sm:text-4xl lg:text-[44px]">
            Preguntas frecuentes
          </ChromeHeading>

          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {FAQS.map((faq, i) => {
              const isOpen = openIndex === i
              return (
                <div key={faq.q} className="card overflow-hidden rounded-xl">
                  <h3 className="m-0">
                    <button
                      type="button"
                      id={`faq-boton-${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      onClick={() => setOpenIndex(isOpen ? -1 : i)}
                      className="flex min-h-[56px] w-full cursor-pointer items-center justify-between gap-4 px-6 py-4 text-left text-[15px] font-semibold text-bright transition-colors hover:text-white"
                    >
                      {faq.q}
                      <IconChevronDown
                        className={`h-5 w-5 flex-shrink-0 text-steel transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </h3>
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-boton-${i}`}
                    hidden={!isOpen}
                    className="px-6 pb-5 text-sm leading-[1.75] text-body [text-wrap:pretty]"
                  >
                    {faq.a}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
