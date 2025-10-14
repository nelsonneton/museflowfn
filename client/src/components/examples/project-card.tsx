import { ProjectCard } from "../project-card"

export default function ProjectCardExample() {
  return (
    <div className="max-w-sm">
      <ProjectCard
        title="Summer Vibes 2024"
        artist="Luna Rivera"
        status="in_progress"
        sceneCount={8}
        completedScenes={5}
        outputMode="YouTube + Spotify Canvas"
        onClick={() => console.log("Project clicked")}
      />
    </div>
  )
}
