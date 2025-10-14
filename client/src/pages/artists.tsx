import { ArtistCard } from "@/components/artist-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { queryClient, apiRequest } from "@/lib/queryClient"
import { useLocation } from "wouter"
import { useToast } from "@/hooks/use-toast"
import type { Artist } from "@shared/schema"

export default function Artists() {
  const [searchQuery, setSearchQuery] = useState("")
  const [, setLocation] = useLocation()
  const { toast } = useToast()

  const { data: artists = [], isLoading } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
  })

  const createArtistMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/artists", {
        name: `Artist ${artists.length + 1}`,
        status: "active",
        genre: "Pop",
        platform: "Spotify",
        followers: 0
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artists"] })
    },
  })

  const deleteArtistMutation = useMutation({
    mutationFn: async (artistId: string) => {
      return apiRequest("DELETE", `/api/artists/${artistId}`, {})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artists"] })
      toast({
        title: "Artista excluído!",
        description: "O artista foi removido com sucesso.",
      })
    },
    onError: () => {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o artista. Tente novamente.",
        variant: "destructive",
      })
    },
  })

  const handleCreateArtist = () => {
    createArtistMutation.mutate()
  }

  const handleDeleteArtist = (artistId: string) => {
    deleteArtistMutation.mutate(artistId)
  }

  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">Artists</h1>
          <p className="text-muted-foreground">Manage your artist roster</p>
        </div>
        <Button onClick={handleCreateArtist} data-testid="button-create-artist">
          <Plus className="h-4 w-4 mr-2" />
          Create Artist
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search artists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading artists...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredArtists.map((artist) => (
              <ArtistCard
                key={artist.id}
                displayName={artist.name}
                city={artist.genre}
                country={artist.platform}
                status={artist.status as "active" | "paused" | "archived"}
                isAi={true}
                projectCount={artist.followers}
                onClick={() => setLocation(`/artists/${artist.id}`)}
                onDelete={() => handleDeleteArtist(artist.id)}
              />
            ))}
          </div>

          {filteredArtists.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? `No artists found matching "${searchQuery}"` : "No artists yet. Create your first artist!"}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
