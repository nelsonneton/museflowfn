import { ImageCurationCard } from "@/components/image-curation-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Sparkles } from "lucide-react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { CuratedImage, Artist } from "@shared/schema"

export default function Curation() {
  const [activeTab, setActiveTab] = useState("ready")

  const { data: artists = [] } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
  })

  const firstArtistId = artists[0]?.id

  const { data: images = [], isLoading: isLoadingImages } = useQuery<CuratedImage[]>({
    queryKey: ["/api/curated-images", firstArtistId],
    enabled: !!firstArtistId,
    queryFn: async () => {
      if (!firstArtistId) return []
      const response = await fetch(`/api/curated-images?artistId=${firstArtistId}`)
      if (!response.ok) throw new Error('Failed to fetch images')
      return response.json()
    }
  })

  const imagesWithStatus = images.map(img => ({
    ...img,
    status: img.approved === 1 ? "approved" : img.approved === -1 ? "rejected" : img.imageUrl ? "ready" : "generating"
  }))

  const filteredImages = imagesWithStatus.filter((img) => {
    if (activeTab === "all") return true
    return img.status === activeTab
  })

  const handleApprove = (id: string) => {
    console.log("Approved image:", id)
  }

  const handleReject = (id: string) => {
    console.log("Rejected image:", id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">Image Curation</h1>
          <p className="text-muted-foreground">Review and approve AI-generated images</p>
        </div>
        <Button data-testid="button-generate-image">
          <Sparkles className="h-4 w-4 mr-2" />
          Generate New
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="ready" data-testid="tab-ready">Ready ({imagesWithStatus.filter(i => i.status === "ready").length})</TabsTrigger>
          <TabsTrigger value="generating" data-testid="tab-generating">Generating</TabsTrigger>
          <TabsTrigger value="approved" data-testid="tab-approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected" data-testid="tab-rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoadingImages || !firstArtistId ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {!firstArtistId ? "No artists found. Create an artist first." : "Loading images..."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredImages.map((image) => (
                  <ImageCurationCard
                    key={image.id}
                    imageUrl={image.imageUrl}
                    prompt={image.prompt || ""}
                    status={image.status as "generating" | "ready" | "approved" | "rejected"}
                    seed={image.rating}
                    onApprove={() => handleApprove(image.id)}
                    onReject={() => handleReject(image.id)}
                  />
                ))}
              </div>

              {filteredImages.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No images in this category</p>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
