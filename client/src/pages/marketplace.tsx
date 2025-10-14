import { MarketplaceListingCard } from "@/components/marketplace-listing-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { MarketplaceListing, Artist } from "@shared/schema"

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const { data: listings = [], isLoading: isLoadingListings } = useQuery<MarketplaceListing[]>({
    queryKey: ["/api/marketplace-listings"],
  })

  const { data: artists = [] } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
  })

  const artistMap = new Map(artists.map(a => [a.id, a.name]))

  const filteredListings = listings.filter((listing) => {
    const artistName = artistMap.get(listing.artistId) || ""
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artistName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "all" || listing.type === activeTab
    return matchesSearch && matchesTab
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">Marketplace</h1>
          <p className="text-muted-foreground">Browse and manage content licenses</p>
        </div>
        <Button data-testid="button-create-listing">
          <Plus className="h-4 w-4 mr-2" />
          Create Listing
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search listings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
          <TabsTrigger value="social_media" data-testid="tab-social">Social Media</TabsTrigger>
          <TabsTrigger value="advertising" data-testid="tab-advertising">Advertising</TabsTrigger>
          <TabsTrigger value="exclusive" data-testid="tab-exclusive">Exclusive</TabsTrigger>
          <TabsTrigger value="custom" data-testid="tab-custom">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoadingListings ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading listings...</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredListings.map((listing) => (
                  <MarketplaceListingCard
                    key={listing.id}
                    title={listing.title}
                    artist={artistMap.get(listing.artistId) || "Unknown Artist"}
                    type={listing.type as "social_media" | "advertising" | "exclusive" | "custom"}
                    price={listing.price}
                    duration={listing.duration || undefined}
                    views={listing.views}
                    imageUrl={listing.imageUrl || undefined}
                    status={listing.status as "active" | "paused" | "sold"}
                    onClick={() => console.log("Listing clicked:", listing.title)}
                  />
                ))}
              </div>

              {filteredListings.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {searchQuery ? `No listings found matching "${searchQuery}"` : "No listings yet. Create your first listing!"}
                  </p>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
