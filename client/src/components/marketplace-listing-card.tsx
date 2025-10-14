import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, DollarSign } from "lucide-react"

interface MarketplaceListingCardProps {
  title: string
  artist: string
  type: "social_media" | "advertising" | "exclusive" | "custom"
  price: number
  duration?: string
  views: number
  imageUrl?: string
  status: "active" | "paused" | "sold"
  onClick?: () => void
}

const typeColors = {
  social_media: "bg-chart-1/20 text-chart-1",
  advertising: "bg-chart-2/20 text-chart-2",
  exclusive: "bg-chart-4/20 text-chart-4",
  custom: "bg-chart-3/20 text-chart-3",
}

const statusColors = {
  active: "bg-chart-3/20 text-chart-3",
  paused: "bg-chart-4/20 text-chart-4",
  sold: "bg-muted text-muted-foreground",
}

export function MarketplaceListingCard({
  title,
  artist,
  type,
  price,
  duration,
  views,
  imageUrl,
  status,
  onClick,
}: MarketplaceListingCardProps) {
  const typeLabel = type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())

  return (
    <Card className="hover-elevate cursor-pointer overflow-hidden" onClick={onClick} data-testid="card-listing">
      <div className="aspect-video bg-muted relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <DollarSign className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <Badge className={`absolute top-2 right-2 ${statusColors[status]}`} data-testid={`badge-status-${status}`}>
          {status}
        </Badge>
      </div>
      <CardHeader className="pb-3">
        <h3 className="font-semibold text-base truncate" data-testid="text-listing-title">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground truncate">{artist}</p>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-semibold" data-testid="text-listing-price">
              ${price.toLocaleString()}
            </div>
            {duration && (
              <div className="text-xs text-muted-foreground">{duration}</div>
            )}
          </div>
          <Badge className={typeColors[type]}>
            {typeLabel}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="pt-0 text-xs text-muted-foreground">
        <Eye className="h-3 w-3 mr-1" />
        {views} views
      </CardFooter>
    </Card>
  )
}
