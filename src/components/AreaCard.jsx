import { Link } from 'react-router-dom'
import { cheapest } from '../data/plans.js'
import { formatEuro } from '../utils/format.js'

/**
 * Tarjeta de área en la home. El «desde» filtra: quien pulsa ya conoce el
 * orden de precio, así que llegan menos consultas de curioseo.
 */
export default function AreaCard({ area, to, unit, img, imgAlt }) {
  return (
    <article className="card flex flex-col overflow-hidden">
      <div className="mx-3 mt-3 h-64 overflow-hidden rounded-xl border border-line/80 sm:h-72">
        <img
          src={img}
          alt={imgAlt}
          width="1080"
          height="1718"
          loading="lazy"
          className="h-full w-full object-cover"
          style={{ objectPosition: '50% 12%' }}
        />
      </div>
      <div className="flex flex-1 flex-col px-6 pb-7 pt-6">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-steel">{area.tag}</p>
        <h3 className="text-chrome mt-1.5 font-display text-[24px] font-bold uppercase leading-tight">
          {area.name}
        </h3>
        <p className="mt-2.5 flex-1 text-[15px] leading-relaxed text-body [text-wrap:pretty]">
          {area.summary}
        </p>
        <p className="mt-4 text-sm text-dim">
          Desde{' '}
          <span className="nums font-display text-xl font-bold text-bright">
            {formatEuro(cheapest(area))}
          </span>{' '}
          / {unit}
        </p>
        <Link to={to} className="btn-chrome mt-4">
          {area.name}
        </Link>
      </div>
    </article>
  )
}
