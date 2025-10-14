import { KPICard } from "@/components/kpi-card"
import { ConsistencyAlert } from "@/components/consistency-alert"
import { CalendarSlot } from "@/components/calendar-slot"
import { Users, FolderKanban, Calendar as CalendarIcon, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { queryClient, apiRequest } from "@/lib/queryClient"
import type { Artist, Project, ConsistencyAlert as Alert, CalendarSlot as Slot } from "@shared/schema"

export default function Dashboard() {
  const { data: artists = [] } = useQuery<Artist[]>({
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

  const handleCreateArtist = () => {
    createArtistMutation.mutate()
  }

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  })

  const firstArtistId = artists[0]?.id

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ["/api/consistency-alerts", firstArtistId],
    enabled: !!firstArtistId,
    queryFn: async () => {
      if (!firstArtistId) return []
      const response = await fetch(`/api/consistency-alerts?artistId=${firstArtistId}`)
      if (!response.ok) throw new Error('Failed to fetch alerts')
      return response.json()
    }
  })

  const { data: slots = [] } = useQuery<Slot[]>({
    queryKey: ["/api/calendar-slots", firstArtistId],
    enabled: !!firstArtistId,
    queryFn: async () => {
      if (!firstArtistId) return []
      const response = await fetch(`/api/calendar-slots?artistId=${firstArtistId}`)
      if (!response.ok) throw new Error('Failed to fetch slots')
      return response.json()
    }
  })

  const activeArtists = artists.filter(a => a.status === "active").length
  const activeProjects = projects.filter(p => p.status === "in_progress").length
  const unresolvedAlerts = alerts.filter(a => !a.resolved).length

  const kpis = [
    { title: "Active Artists", value: activeArtists, icon: Users, subtitle: "total artists" },
    { title: "Active Projects", value: activeProjects, icon: FolderKanban, subtitle: "in progress" },
    { title: "Upcoming Events", value: slots.length, icon: CalendarIcon, subtitle: "scheduled" },
    { title: "Consistency Alerts", value: unresolvedAlerts, icon: AlertTriangle, subtitle: "need attention" },
  ]
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
            <CardTitle className="text-lg">Consistency Alerts</CardTitle>
            <Button size="sm" variant="ghost" data-testid="button-view-all-alerts">
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No consistency alerts</p>
              </div>
            ) : (
              alerts.slice(0, 3).map((alert) => {
                const severity = (alert.severity === "low" || alert.severity === "medium" || alert.severity === "high") 
                  ? alert.severity 
                  : "medium"
                return (
                  <ConsistencyAlert
                    key={alert.id}
                    entity={alert.title}
                    entityType="Alert"
                    issue={alert.description}
                    severity={severity}
                    onQuickFix={() => console.log("Quick fix:", alert.id)}
                    onViewDetails={() => console.log("View details:", alert.id)}
                  />
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
            <CardTitle className="text-lg">This Week's Agenda</CardTitle>
            <Button size="sm" variant="ghost" data-testid="button-view-calendar">
              View Calendar
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {slots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No scheduled events</p>
              </div>
            ) : (
              slots.slice(0, 3).map((slot) => (
                <CalendarSlot
                  key={slot.id}
                  label={slot.label}
                  contentType={slot.contentType}
                  status={slot.status as "planned" | "approved" | "published"}
                  onDuplicate={() => console.log("Duplicate:", slot.id)}
                  onEdit={() => console.log("Edit:", slot.id)}
                  onDelete={() => console.log("Delete:", slot.id)}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={handleCreateArtist} disabled={createArtistMutation.isPending} data-testid="button-create-artist">
            <Plus className="h-4 w-4 mr-2" />
            {createArtistMutation.isPending ? "Creating..." : "Create Artist"}
          </Button>
          <Button variant="outline" data-testid="button-new-project">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
          <Button variant="outline" data-testid="button-schedule-content">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Content
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
