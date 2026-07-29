import PlanCard from './PlanCard.jsx'

export default function PlanGrid({ plans, onSelect }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} onSelect={onSelect} />
      ))}
    </div>
  )
}
