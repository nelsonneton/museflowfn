import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, User, Package, Lightbulb } from "lucide-react"

interface RealityNodeCardProps {
  type: "location" | "character" | "possession" | "concept"
  name: string
  description: string
  metadata?: string
  onClick?: () => void
}

const typeConfig = {
  location: {
    icon: MapPin,
    color: "bg-chart-1/20 text-chart-1",
    label: "Location",
  },
  character: {
    icon: User,
    color: "bg-chart-2/20 text-chart-2",
    label: "Character",
  },
  possession: {
    icon: Package,
    color: "bg-chart-3/20 text-chart-3",
    label: "Possession",
  },
  concept: {
    icon: Lightbulb,
    color: "bg-chart-4/20 text-chart-4",
    label: "Concept",
  },
}

export function RealityNodeCard({ type, name, description, metadata, onClick }: RealityNodeCardProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <Card className="hover-elevate cursor-pointer" onClick={onClick} data-testid={`card-${type}-${name.toLowerCase().replace(/ /g, '-')}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-md ${config.color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm truncate" data-testid="text-node-name">{name}</h4>
              <Badge variant="outline" className="text-xs">
                {config.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
            {metadata && (
              <p className="text-xs text-muted-foreground mt-2 font-mono">{metadata}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
