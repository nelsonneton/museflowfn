import { CalendarSlot } from "../calendar-slot"

export default function CalendarSlotExample() {
  return (
    <div className="max-w-sm">
      <CalendarSlot
        label="Instagram Reel"
        contentType="Social Media"
        status="approved"
        brief="Behind the scenes studio session with new track preview"
        onDuplicate={() => console.log("Duplicate clicked")}
        onEdit={() => console.log("Edit clicked")}
        onDelete={() => console.log("Delete clicked")}
      />
    </div>
  )
}
