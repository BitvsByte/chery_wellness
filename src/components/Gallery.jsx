import { GALLERY, CONTACT, CONTACT_LINKS } from '../data/content.js'
import ChromeHeading from './ui/ChromeHeading.jsx'
import { IconInstagram, IconTikTok } from './ui/Icons.jsx'

export default function Gallery() {
  return (
    <section id="galeria" aria-labelledby="titulo-galeria" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="panel p-6 sm:p-11">
          <ChromeHeading id="titulo-galeria" className="mb-10 text-4xl sm:text-5xl">
            Galería
          </ChromeHeading>

          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GALLERY.map((item) => (
              <li key={item.label}>
                <figure className="relative h-[360px] overflow-hidden rounded-[14px] border border-[rgba(209,213,219,0.3)] shadow-[0_14px_34px_rgba(0,0,0,0.55)] transition-colors duration-200 hover:border-[rgba(229,231,235,0.65)]">
                  <img
                    src={item.img}
                    alt={item.alt}
                    width={item.width}
                    height={item.height}
                    loading="lazy"
                    className="h-full w-full object-cover"
                    style={{ objectPosition: item.pos }}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(10,10,11,0.88))]"
                  />
                  <figcaption className="absolute inset-x-4 bottom-3.5 text-[11px] font-bold uppercase tracking-[0.15em] text-bright">
                    {item.label}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap justify-center gap-3.5">
            <a
              href={CONTACT_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-chrome gap-2.5"
            >
              <IconInstagram className="h-4 w-4" />
              Instagram · {CONTACT.instagram}
              <span className="sr-only">(se abre en una pestaña nueva)</span>
            </a>
            <a
              href={CONTACT_LINKS.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost gap-2.5"
            >
              <IconTikTok className="h-4 w-4" />
              TikTok · {CONTACT.tiktok}
              <span className="sr-only">(se abre en una pestaña nueva)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
