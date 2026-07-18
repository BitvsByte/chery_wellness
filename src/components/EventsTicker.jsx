import { useState } from 'react'
import { EVENTS } from '../data/content.js'
import { IconPause, IconPlay } from './ui/Icons.jsx'

function TickerRow({ hidden = false }) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-16 pr-16"
    >
      {EVENTS.map((event) => (
        <li
          key={event.name}
          className="flex items-center gap-3 whitespace-nowrap text-xs font-semibold tracking-[0.2em]"
        >
          <span aria-hidden="true" className="text-[9px] text-steel">
            ◆
          </span>
          <span className="text-[#8b9099]">{event.date}</span>
          <span className="text-[#d7dae0]">{event.name}</span>
        </li>
      ))}
    </ul>
  )
}

/**
 * Cinta de próximos eventos. El movimiento se puede pausar (WCAG 2.2.2)
 * y respeta prefers-reduced-motion vía CSS global.
 */
export default function EventsTicker() {
  const [paused, setPaused] = useState(false)

  return (
    <section aria-label="Próximos eventos" className="relative mt-12">
      <div className="overflow-hidden border-y border-[rgba(156,163,175,0.14)] bg-gradient-to-r from-transparent via-[#1d1e20] to-transparent py-3.5 pr-14">
        <div
          className="flex w-max animate-marquee"
          style={paused ? { animationPlayState: 'paused' } : undefined}
        >
          <TickerRow />
          <TickerRow hidden />
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused(!paused)}
        aria-pressed={paused}
        className="glass-chip metal-rim absolute right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-silver transition-colors hover:text-white"
      >
        <span className="sr-only">
          {paused ? 'Reanudar la cinta de eventos' : 'Pausar la cinta de eventos'}
        </span>
        {paused ? <IconPlay className="h-4 w-4" /> : <IconPause className="h-4 w-4" />}
      </button>
    </section>
  )
}
