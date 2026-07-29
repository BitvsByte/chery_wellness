import ServicePage from '../components/ServicePage.jsx'
import { POSING } from '../data/plans.js'
import { FAQS_POSING } from '../data/content.js'

export default function PosingPage() {
  return (
    <ServicePage area={POSING} plans={POSING.packs} faqs={FAQS_POSING} intro={POSING.summary} />
  )
}
