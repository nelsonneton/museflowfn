import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Instagram, Youtube, Music, Share2, Clock, CheckCircle, XCircle } from "lucide-react"
import { SiTiktok, SiSpotify } from "react-icons/si"

//todo: remove mock functionality
const mockPosts = [
  { id: "1", platform: "Instagram", content: "Behind the scenes studio session", scheduledFor: "2024-01-15 10:00", status: "scheduled" as const },
  { id: "2", platform: "TikTok", content: "New dance challenge preview", scheduledFor: "2024-01-15 14:00", status: "published" as const },
  { id: "3", platform: "YouTube", content: "Album announcement teaser", scheduledFor: "2024-01-16 09:00", status: "scheduled" as const },
  { id: "4", platform: "Spotify", content: "Canvas animation update", scheduledFor: "2024-01-14 12:00", status: "failed" as const },
]

const platformIcons = {
  Instagram: Instagram,
  TikTok: SiTiktok,
  YouTube: Youtube,
  Spotify: SiSpotify,
}

const statusConfig = {
  scheduled: { label: "Scheduled", color: "bg-chart-4/20 text-chart-4", icon: Clock },
  published: { label: "Published", color: "bg-chart-3/20 text-chart-3", icon: CheckCircle },
  failed: { label: "Failed", color: "bg-chart-5/20 text-chart-5", icon: XCircle },
}

export default function Social() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">Social Automation</h1>
          <p className="text-muted-foreground">Manage multi-platform content publishing</p>
        </div>
        <Button data-testid="button-schedule-post">
          <Share2 className="h-4 w-4 mr-2" />
          Schedule Post
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {["Instagram", "TikTok", "YouTube", "Spotify"].map((platform) => {
          const Icon = platformIcons[platform as keyof typeof platformIcons]
          return (
            <Card key={platform}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{platform}</div>
                    <div className="text-xs text-muted-foreground">Connected</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Publishing Queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockPosts.map((post) => {
            const PlatformIcon = platformIcons[post.platform as keyof typeof platformIcons]
            const statusCfg = statusConfig[post.status]
            const StatusIcon = statusCfg.icon

            return (
              <Card key={post.id} className="hover-elevate">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <PlatformIcon className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm mb-1" data-testid="text-post-content">{post.content}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{post.platform}</span>
                          <span>•</span>
                          <span className="font-mono">{post.scheduledFor}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={statusCfg.color} data-testid={`badge-status-${post.status}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusCfg.label}
                    </Badge>
                  </div>
                  {post.status === "failed" && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" data-testid="button-retry">
                        Retry
                      </Button>
                      <Button size="sm" variant="ghost" data-testid="button-view-logs">
                        View Logs
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
