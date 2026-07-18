import { NAV_LINKS } from '../data/content.js'

export default function Footer() {
  return (
    <footer className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 pb-12 pt-6 sm:px-6">
      <img
        src="/icons/pwa-192.png"
        alt=""
        width="74"
        height="74"
        loading="lazy"
        className="h-[74px] w-[74px] rounded-full border border-[rgba(209,213,219,0.4)] object-cover shadow-[0_0_26px_rgba(229,231,235,0.18)]"
      />
      <div className="flex w-full flex-col items-center gap-3 border-t border-[rgba(156,163,175,0.2)] pt-6">
        <nav aria-label="Pie de página">
          <ul className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[13px] font-semibold uppercase tracking-[0.18em]">
            {NAV_LINKS.map((link, i) => (
              <li key={link.href} className="flex items-center gap-2">
                {i > 0 && (
                  <span aria-hidden="true" className="text-[#565c66]">
                    |
                  </span>
                )}
                <a
                  href={link.href}
                  className="inline-block py-2 text-[#b6bac1] transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-center text-[11px] uppercase tracking-wider text-[#7c828c]">
          © 2026 Chery Figueroa Wellness PRO · Elite Coaching · Bodybuilding · Wellness Aesthetics
        </p>
      </div>
    </footer>
  )
}
