import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FolderKanban, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface ProjectCardProps {
  title: string
  artist: string
  status: "draft" | "in_progress" | "review" | "completed"
  sceneCount: number
  completedScenes: number
  outputMode: string
  onClick?: () => void
}

const statusConfig = {
  draft: {
    label: "Draft",
    color: "bg-muted text-muted-foreground",
    icon: Clock,
  },
  in_progress: {
    label: "In Progress",
    color: "bg-chart-2/20 text-chart-2",
    icon: Clock,
  },
  review: {
    label: "Review",
    color: "bg-chart-4/20 text-chart-4",
    icon: AlertCircle,
  },
  completed: {
    label: "Completed",
    color: "bg-chart-3/20 text-chart-3",
    icon: CheckCircle,
  },
}

export function ProjectCard({
  title,
  artist,
  status,
  sceneCount,
  completedScenes,
  outputMode,
  onClick,
}: ProjectCardProps) {
  const config = statusConfig[status]
  const StatusIcon = config.icon
  const progress = sceneCount > 0 ? (completedScenes / sceneCount) * 100 : 0

  return (
    <Card className="hover-elevate cursor-pointer" onClick={onClick} data-testid="card-project">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base" data-testid="text-project-title">{title}</CardTitle>
          </div>
          <Badge className={config.color} data-testid={`badge-status-${status}`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{artist}</p>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span data-testid="text-project-progress">{completedScenes}/{sceneCount} scenes</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Badge variant="outline" className="text-xs">
          {outputMode}
        </Badge>
      </CardFooter>
    </Card>
  )
}
