import { ABOUT } from '../data/content.js'
import ChromeHeading from './ui/ChromeHeading.jsx'

export default function About() {
  return (
    <section id="nosotras" aria-labelledby="titulo-nosotras" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ChromeHeading id="titulo-nosotras" className="mb-9 text-4xl sm:text-5xl lg:text-[58px]">
          {ABOUT.heading}
        </ChromeHeading>

        <div className="panel grid grid-cols-1 gap-10 p-6 sm:p-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-2xl font-semibold text-bright">
              {ABOUT.title}
            </h3>
            {ABOUT.paragraphs.map((text) => (
              <p key={text.slice(0, 24)} className="text-[15px] leading-[1.8] text-body [text-wrap:pretty]">
                {text}
              </p>
            ))}
          </div>

          <div className="relative pb-10 sm:pb-8">
            <img
              src={ABOUT.mainImg}
              alt={ABOUT.mainImgAlt}
              width="1080"
              height="1718"
              loading="lazy"
              className="h-[340px] w-full rounded-2xl border border-[rgba(209,213,219,0.4)] object-cover shadow-[0_18px_44px_rgba(0,0,0,0.6)]"
              style={{ objectPosition: '50% 8%' }}
            />
            <img
              src={ABOUT.teamImg}
              alt={ABOUT.teamImgAlt}
              width="816"
              height="954"
              loading="lazy"
              className="absolute -bottom-1 -left-2 h-32 w-40 rounded-xl border-2 border-[rgba(229,231,235,0.5)] object-cover shadow-[0_14px_34px_rgba(0,0,0,0.7)] sm:-left-6"
              style={{ objectPosition: '50% 25%' }}
            />
          </div>
        </div>

        {/* Pedestal de tarima con barra de luz — firma visual de la sección */}
        <div
          aria-hidden="true"
          className="relative mx-auto h-14 w-[76%] overflow-hidden rounded-b-[34px] border border-t-0 border-line/80 bg-gradient-to-b from-[#3a3b3e] to-[#151617] shadow-[0_26px_50px_rgba(0,0,0,0.65)]"
        >
          <div className="absolute inset-x-[10%] bottom-3.5 h-[5px] rounded-[3px] bg-[linear-gradient(90deg,transparent,#e5e7eb_25%,#ffffff_50%,#e5e7eb_75%,transparent)] shadow-[0_0_18px_rgba(229,231,235,0.7)]" />
        </div>
      </div>
    </section>
  )
}
