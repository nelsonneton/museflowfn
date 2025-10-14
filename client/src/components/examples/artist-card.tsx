import { ArtistCard } from "../artist-card"

export default function ArtistCardExample() {
  return (
    <div className="max-w-sm">
      <ArtistCard
        displayName="Luna Rivera"
        city="Los Angeles"
        country="USA"
        status="active"
        isAi={false}
        projectCount={5}
        onClick={() => console.log("Artist clicked")}
      />
    </div>
  )
}
