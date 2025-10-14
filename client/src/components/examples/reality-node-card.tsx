import { RealityNodeCard } from "../reality-node-card"

export default function RealityNodeCardExample() {
  return (
    <div className="max-w-sm">
      <RealityNodeCard
        type="location"
        name="Studio Residence"
        description="Main recording studio and creative space in downtown LA"
        metadata="First appearance: 2023-01"
        onClick={() => console.log("Node clicked")}
      />
    </div>
  )
}
