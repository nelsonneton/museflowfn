import { MarketplaceListingCard } from "../marketplace-listing-card"

export default function MarketplaceListingCardExample() {
  return (
    <div className="max-w-sm">
      <MarketplaceListingCard
        title="Instagram Content Package - Q1 2024"
        artist="Luna Rivera"
        type="social_media"
        price={2500}
        duration="3 months"
        views={342}
        imageUrl="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop"
        status="active"
        onClick={() => console.log("Listing clicked")}
      />
    </div>
  )
}
