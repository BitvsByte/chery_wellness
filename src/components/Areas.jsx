import { TRAINING, POSING, ROUTES } from '../data/plans.js'
import AreaCard from './AreaCard.jsx'

export default function Areas() {
  return (
    <section id="servicios" aria-labelledby="titulo-servicios" className="scroll-mt-24">
      <div className="safe-x mx-auto max-w-6xl pt-11 sm:px-6">
        <h2 id="titulo-servicios" className="sr-only">
          Servicios
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <AreaCard
            area={TRAINING}
            to={ROUTES.training}
            unit="mes"
            img="/uploads/chery_4.jpeg"
            imgAlt="Chery Figueroa en condición de competición durante el IFBB Pro League de Pittsburgh"
          />
          <AreaCard
            area={POSING}
            to={ROUTES.posing}
            unit="clase"
            img="/uploads/chery_2.jpeg"
            imgAlt="Chery Figueroa en pose frontal sobre la tarima del Miami Pro"
          />
        </div>
      </div>
    </section>
  )
}
