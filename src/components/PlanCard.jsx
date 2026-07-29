import { formatEuro } from '../utils/format.js'

/**
 * Tarjeta de un plan con su escalera de precios.
 *
 * La escalera va en <dl> porque cada duración (dt) tiene un importe (dd):
 * un lector de pantalla las lee emparejadas en lugar de como texto suelto.
 */
export default function PlanCard({ plan, onSelect }) {
  const rim = plan.highlight
    ? 'border-[rgba(229,231,235,0.55)] shadow-[0_0_26px_rgba(229,231,235,0.12)]'
    : ''

  return (
    <article
      id={`plan-${plan.id}`}
      className={`card flex flex-col overflow-hidden p-6 sm:p-7 ${rim}`}
    >
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-steel">{plan.tag}</p>
      <h3 className="text-chrome mt-1.5 font-display text-[26px] font-bold uppercase leading-tight">
        {plan.name}
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-body [text-wrap:pretty]">
        {plan.summary}
      </p>

      <dl className="mt-5 border-t border-line/60">
        {plan.prices.map((price) => (
          <div
            key={price.label}
            className="flex items-baseline justify-between gap-4 border-b border-line/40 py-3"
          >
            <dt className="text-[15px] text-body">{price.label}</dt>
            <dd className="nums text-right font-display text-xl font-bold text-bright">
              {formatEuro(price.amount)}
              {price.savings > 0 && (
                <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-steel">
                  Ahorras {formatEuro(price.savings)}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-dim">IVA incluido</p>

      <ul className="mt-5 flex flex-1 flex-col gap-2 text-[15px] leading-relaxed text-body">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2.5">
            <span aria-hidden="true" className="text-steel">
              ·
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-2.5">
        {plan.prices.map((price) => (
          <button
            key={price.label}
            type="button"
            onClick={() => onSelect(plan.id, price.label)}
            className={plan.highlight ? 'btn-chrome' : 'btn-ghost'}
          >
            Solicitar {price.label}
          </button>
        ))}
      </div>
    </article>
  )
}
