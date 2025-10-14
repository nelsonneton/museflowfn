import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Lightbulb, Wand2 } from "lucide-react"
import { useState } from "react"

export default function AIGeneration() {
  const [prompt, setPrompt] = useState("")
  const [generatedContent, setGeneratedContent] = useState<string[]>([])

  const handleGenerate = () => {
    //todo: remove mock functionality
    const mockSuggestions = [
      "A futuristic cityscape at twilight with neon reflections on rain-soaked streets",
      "Intimate studio session showing artist's creative process with vintage equipment",
      "Dynamic performance shot with dramatic stage lighting and crowd silhouettes"
    ]
    setGeneratedContent(mockSuggestions)
    console.log("Generating content with prompt:", prompt)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">AI Generation</h1>
        <p className="text-muted-foreground">Generate creative content and suggestions</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Content Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Context & Prompt</label>
              <Textarea
                placeholder="Describe the scene, mood, or concept you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-32"
                data-testid="textarea-prompt"
              />
            </div>
            <Button onClick={handleGenerate} className="w-full" data-testid="button-generate">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Suggestions
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {generatedContent.length > 0 ? (
              generatedContent.map((content, i) => (
                <Card key={i} className="hover-elevate cursor-pointer" onClick={() => console.log("Selected:", content)}>
                  <CardContent className="p-4">
                    <p className="text-sm" data-testid={`text-suggestion-${i}`}>{content}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Generate content to see AI suggestions here
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Consistency Check</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Validate narrative elements against Reality Engine
            </p>
            <Button variant="outline" className="w-full" data-testid="button-check-consistency">
              Run Check
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Element Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Get AI recommendations for new locations, characters, or concepts
            </p>
            <Button variant="outline" className="w-full" data-testid="button-suggest-elements">
              Generate Ideas
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scene Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Browse and customize seasonal content templates
            </p>
            <Button variant="outline" className="w-full" data-testid="button-view-templates">
              View Templates
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
