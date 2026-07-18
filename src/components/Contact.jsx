import { CONTACT, CONTACT_LINKS, QUOTE } from '../data/content.js'
import ChromeHeading from './ui/ChromeHeading.jsx'
import ContactForm from './ContactForm.jsx'
import { IconMail, IconWhatsApp, IconInstagram, IconTikTok } from './ui/Icons.jsx'

const CHANNELS = [
  {
    href: CONTACT_LINKS.mailto,
    icon: IconMail,
    label: CONTACT.email,
    external: false,
  },
  {
    href: CONTACT_LINKS.whatsapp,
    icon: IconWhatsApp,
    label: `WhatsApp · ${CONTACT.phone}`,
    external: true,
  },
  {
    href: CONTACT_LINKS.instagram,
    icon: IconInstagram,
    label: `Instagram · ${CONTACT.instagram}`,
    external: true,
  },
  {
    href: CONTACT_LINKS.tiktok,
    icon: IconTikTok,
    label: `TikTok · ${CONTACT.tiktok}`,
    external: true,
  },
]

export default function Contact() {
  return (
    <section id="contacto" aria-labelledby="titulo-contacto" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
        <div className="panel p-6 sm:p-11">
          <ChromeHeading id="titulo-contacto" className="mb-3 text-4xl sm:text-5xl lg:text-[58px]">
            Contacto
          </ChromeHeading>
          <p className="mx-auto mb-9 max-w-lg text-center text-sm leading-relaxed text-dim [text-wrap:pretty]">
            Las plazas del equipo son limitadas. Cuéntanos tu punto de partida y tu objetivo; Chery
            revisa personalmente cada solicitud.
          </p>

          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <ContactForm />

            <aside aria-label="Canales de contacto" className="flex flex-col gap-5 lg:pt-2">
              <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-[#d7dae0]">
                Contacto directo
              </h3>
              <ul className="flex flex-col gap-2">
                {CHANNELS.map(({ href, icon: ChannelIcon, label, external }) => (
                  <li key={label}>
                    <a
                      href={href}
                      {...(external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      className="flex min-h-[44px] items-center gap-3 text-sm text-body transition-colors hover:text-white"
                    >
                      <ChannelIcon className="h-[18px] w-[18px] flex-shrink-0 text-silver" />
                      {label}
                      {external && <span className="sr-only">(se abre en una pestaña nueva)</span>}
                    </a>
                  </li>
                ))}
              </ul>

              <figure className="relative mt-1 overflow-hidden rounded-[14px] border border-[rgba(209,213,219,0.3)]">
                <img
                  src={QUOTE.img}
                  alt={QUOTE.alt}
                  width="1080"
                  height="1714"
                  loading="lazy"
                  className="h-[250px] w-full object-cover"
                  style={{ objectPosition: '50% 12%' }}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(10,10,11,0.9))]"
                />
                <figcaption className="absolute inset-x-4 bottom-3.5">
                  <p className="font-display text-base font-semibold leading-snug text-bright">
                    {QUOTE.text}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-dim">
                    {QUOTE.author}
                  </p>
                </figcaption>
              </figure>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
