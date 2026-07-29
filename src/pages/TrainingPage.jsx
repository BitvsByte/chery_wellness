import ServicePage from '../components/ServicePage.jsx'
import { TRAINING } from '../data/plans.js'
import { FAQS_TRAINING } from '../data/content.js'

export default function TrainingPage() {
  return (
    <ServicePage
      area={TRAINING}
      plans={TRAINING.tiers}
      faqs={FAQS_TRAINING}
      intro={TRAINING.summary}
    />
  )
}
