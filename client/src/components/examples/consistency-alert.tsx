import { ConsistencyAlert } from "../consistency-alert"

export default function ConsistencyAlertExample() {
  return (
    <div className="max-w-2xl">
      <ConsistencyAlert
        entity="Downtown LA Studio"
        entityType="Location"
        issue="First appearance date (2024-03) is after referenced timeline event (2024-01)"
        severity="high"
        onQuickFix={() => console.log("Quick fix clicked")}
        onViewDetails={() => console.log("View details clicked")}
      />
    </div>
  )
}
