import { ImageCurationCard } from "../image-curation-card"

export default function ImageCurationCardExample() {
  return (
    <div className="max-w-xs">
      <ImageCurationCard
        imageUrl="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop"
        prompt="Futuristic music studio with neon lights, cyberpunk aesthetic, professional photography"
        status="ready"
        seed={42857}
        onApprove={() => console.log("Approved")}
        onReject={() => console.log("Rejected")}
      />
    </div>
  )
}
