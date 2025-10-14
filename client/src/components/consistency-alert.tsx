import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowRight } from "lucide-react"

interface ConsistencyAlertProps {
  entity: string
  entityType: string
  issue: string
  severity: "low" | "medium" | "high"
  onQuickFix?: () => void
  onViewDetails?: () => void
}

const severityConfig = {
  low: {
    color: "bg-chart-2/20 text-chart-2",
    label: "Low",
  },
  medium: {
    color: "bg-chart-4/20 text-chart-4",
    label: "Medium",
  },
  high: {
    color: "bg-chart-5/20 text-chart-5",
    label: "High",
  },
}

export function ConsistencyAlert({
  entity,
  entityType,
  issue,
  severity,
  onQuickFix,
  onViewDetails,
}: ConsistencyAlertProps) {
  const config = severityConfig[severity]

  return (
    <Card className="border-l-4" style={{ borderLeftColor: `hsl(var(--chart-${severity === 'high' ? '5' : severity === 'medium' ? '4' : '2'}))` }}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-chart-5 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={config.color} data-testid={`badge-severity-${severity}`}>
                {config.label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {entityType}
              </Badge>
            </div>
            <h4 className="font-medium text-sm mb-1" data-testid="text-alert-entity">{entity}</h4>
            <p className="text-sm text-muted-foreground">{issue}</p>
            <div className="flex items-center gap-2 mt-3">
              {onQuickFix && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onQuickFix}
                  data-testid="button-quick-fix"
                >
                  Quick Fix
                </Button>
              )}
              {onViewDetails && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onViewDetails}
                  data-testid="button-view-details"
                >
                  View Details
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
