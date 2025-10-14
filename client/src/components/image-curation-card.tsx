import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X, Clock, Sparkles } from "lucide-react"

interface ImageCurationCardProps {
  imageUrl: string
  prompt: string
  status: "generating" | "ready" | "approved" | "rejected"
  seed?: number
  onApprove?: () => void
  onReject?: () => void
}

const statusConfig = {
  generating: {
    label: "Generating",
    color: "bg-chart-2/20 text-chart-2",
    icon: Clock,
  },
  ready: {
    label: "Ready for Review",
    color: "bg-chart-4/20 text-chart-4",
    icon: Sparkles,
  },
  approved: {
    label: "Approved",
    color: "bg-chart-3/20 text-chart-3",
    icon: Check,
  },
  rejected: {
    label: "Rejected",
    color: "bg-muted text-muted-foreground",
    icon: X,
  },
}

export function ImageCurationCard({
  imageUrl,
  prompt,
  status,
  seed,
  onApprove,
  onReject,
}: ImageCurationCardProps) {
  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <Card className="overflow-hidden" data-testid="card-image-curation">
      <div className="aspect-square bg-muted relative">
        {status === "generating" ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Clock className="h-8 w-8 text-muted-foreground animate-pulse" />
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={prompt}
            className="w-full h-full object-cover"
            data-testid="img-generated"
          />
        )}
        <Badge className={`absolute top-2 right-2 ${config.color}`} data-testid={`badge-status-${status}`}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>
      </div>
      <CardContent className="p-3">
        <p className="text-xs text-muted-foreground line-clamp-2" data-testid="text-prompt">
          {prompt}
        </p>
        {seed && (
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Seed: {seed}
          </p>
        )}
      </CardContent>
      {status === "ready" && (
        <CardFooter className="p-3 pt-0 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={onReject}
            data-testid="button-reject"
          >
            <X className="h-3 w-3 mr-1" />
            Reject
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={onApprove}
            data-testid="button-approve"
          >
            <Check className="h-3 w-3 mr-1" />
            Approve
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
