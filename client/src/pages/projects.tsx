import { ProjectCard } from "@/components/project-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { Project, Artist } from "@shared/schema"

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  })

  const { data: artists = [] } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
  })

  const artistMap = new Map(artists.map(a => [a.id, a.name]))

  const filteredProjects = projects.filter((project) => {
    const artistName = artistMap.get(project.artistId) || ""
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artistName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "all" || project.status === activeTab
    return matchesSearch && matchesTab
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">Projects</h1>
          <p className="text-muted-foreground">Manage content projects and scenes</p>
        </div>
        <Button data-testid="button-create-project">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
          <TabsTrigger value="draft" data-testid="tab-draft">Draft</TabsTrigger>
          <TabsTrigger value="in_progress" data-testid="tab-in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="review" data-testid="tab-review">Review</TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoadingProjects ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    title={project.title}
                    artist={artistMap.get(project.artistId) || "Unknown Artist"}
                    status={project.status as "draft" | "in_progress" | "review" | "completed"}
                    sceneCount={0}
                    completedScenes={0}
                    outputMode={project.priority}
                    onClick={() => console.log("Project clicked:", project.title)}
                  />
                ))}
              </div>

              {filteredProjects.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {searchQuery ? `No projects found matching "${searchQuery}"` : "No projects yet. Create your first project!"}
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
