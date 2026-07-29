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
            img="/uploads/entrenos.jpeg"
            imgAlt="Chery Figueroa entrenando con una atleta del equipo junto al rack de mancuernas del gimnasio"
            imgWidth={1080}
            imgHeight={1620}
            imgPos="50% 30%"
          />
          <AreaCard
            area={POSING}
            to={ROUTES.posing}
            unit="clase"
            img="/uploads/chery_2.jpeg"
            imgAlt="Chery Figueroa en pose frontal sobre la tarima del Miami Pro"
            imgWidth={1080}
            imgHeight={1672}
            imgPos="50% 12%"
          />
        </div>
      </div>
    </section>
  )
}
