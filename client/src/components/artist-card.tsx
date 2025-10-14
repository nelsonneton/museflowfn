import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MapPin, Bot, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ArtistCardProps {
  displayName: string
  city?: string
  country?: string
  status: "active" | "paused" | "archived"
  isAi: boolean
  projectCount: number
  avatarUrl?: string
  onClick?: () => void
  onDelete?: () => void
}

const statusColors = {
  active: "bg-chart-3/20 text-chart-3",
  paused: "bg-chart-4/20 text-chart-4",
  archived: "bg-muted text-muted-foreground",
}

export function ArtistCard({
  displayName,
  city,
  country,
  status,
  isAi,
  projectCount,
  avatarUrl,
  onClick,
  onDelete,
}: ArtistCardProps) {
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className="hover-elevate cursor-pointer group relative" onClick={onClick} data-testid="card-artist">
      {onDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-destructive/10 hover:text-destructive"
              onClick={(e) => e.stopPropagation()}
              data-testid="button-delete-artist"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Artista</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir <strong>{displayName}</strong>? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDelete) {
                    onDelete();
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base truncate" data-testid="text-artist-name">
                {displayName}
              </h3>
              {isAi && (
                <Badge variant="outline" className="text-xs">
                  <Bot className="h-3 w-3 mr-1" />
                  AI
                </Badge>
              )}
            </div>
            {(city || country) && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">
                  {[city, country].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="text-sm text-muted-foreground">
          {projectCount} {projectCount === 1 ? "project" : "projects"}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Badge className={statusColors[status]} data-testid={`badge-status-${status}`}>
          {status}
        </Badge>
      </CardFooter>
    </Card>
  )
}
