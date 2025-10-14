import { KPICard } from "../kpi-card"
import { Users } from "lucide-react"

export default function KPICardExample() {
  return (
    <KPICard
      title="Active Artists"
      value={24}
      icon={Users}
      trend={{ value: 12, positive: true }}
      subtitle="from last month"
    />
  )
}
