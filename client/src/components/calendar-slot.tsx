import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical, Copy, Edit, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CalendarSlotProps {
  label: string
  contentType: string
  status: "planned" | "approved" | "published"
  brief?: string
  onDuplicate?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

const statusColors = {
  planned: "bg-muted text-muted-foreground",
  approved: "bg-chart-4/20 text-chart-4",
  published: "bg-chart-3/20 text-chart-3",
}

export function CalendarSlot({
  label,
  contentType,
  status,
  brief,
  onDuplicate,
  onEdit,
  onDelete,
}: CalendarSlotProps) {
  return (
    <Card className="p-3 hover-elevate">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate" data-testid="text-slot-label">
            {label}
          </div>
          <div className="text-xs text-muted-foreground truncate">{contentType}</div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6" data-testid="button-slot-menu">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDuplicate} data-testid="button-slot-duplicate">
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit} data-testid="button-slot-edit">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} data-testid="button-slot-delete">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={statusColors[status]} data-testid={`badge-status-${status}`}>
          {status}
        </Badge>
      </div>
      {brief && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{brief}</p>
      )}
    </Card>
  )
}
