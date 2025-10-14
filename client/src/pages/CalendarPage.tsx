import { useState, useCallback, useMemo, useEffect } from "react";
import { Calendar, momentLocalizer, View, SlotInfo } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useArtist } from "@/contexts/ArtistContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCalendarSlotSchema, type CalendarSlot, type InsertCalendarSlot } from "@shared/schema";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

moment.locale("pt-br");
const localizer = momentLocalizer(moment);

// Status colors
const statusColors: Record<string, string> = {
  Planejado: "#6366f1", // indigo/blue
  "Em Produção": "#eab308", // yellow
  Publicado: "#22c55e", // green
  Cancelado: "#ef4444", // red
};

// Content types
const contentTypes = [
  "Reels",
  "TikTok",
  "YouTube Video",
  "Foto Carrossel",
  "Story",
  "Post Feed",
  "IGTV",
  "YouTube Short",
];

// Status options
const statusOptions = ["Planejado", "Em Produção", "Publicado", "Cancelado"];

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: CalendarSlot;
}

export default function CalendarPage() {
  const { selectedArtistId } = useArtist();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarSlot | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarSlot | null>(null);

  // Check for query params from Timeline navigation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const titleFromTimeline = params.get("title");
    const dateFromTimeline = params.get("date");

    if (titleFromTimeline && dateFromTimeline && selectedArtistId) {
      const scheduledDate = new Date(dateFromTimeline);
      const now = new Date();
      
      // Create a pre-filled event
      setSelectedEvent({
        id: "",
        artistId: selectedArtistId,
        title: titleFromTimeline,
        contentType: "Reels",
        status: "Planejado",
        scheduledAt: scheduledDate,
        brief: "",
        createdAt: now,
      } as CalendarSlot);
      
      // Open the dialog
      setIsDialogOpen(true);
      
      // Clear the query params
      setLocation("/calendar", { replace: true });
    }
  }, [selectedArtistId, setLocation]);

  // Calculate date range for fetching events
  const dateRange = useMemo(() => {
    const start = moment(date).startOf(view === "month" ? "month" : "week").subtract(7, "days");
    const end = moment(date).endOf(view === "month" ? "month" : "week").add(7, "days");
    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  }, [date, view]);

  // Fetch calendar events
  const { data: calendarSlots = [], isLoading } = useQuery<CalendarSlot[]>({
    queryKey: ["/api/calendar-slots", selectedArtistId, dateRange.start, dateRange.end],
    queryFn: async () => {
      if (!selectedArtistId) return [];
      const res = await fetch(
        `/api/calendar-slots?artistId=${selectedArtistId}&dateStart=${dateRange.start}&dateEnd=${dateRange.end}`
      );
      if (!res.ok) throw new Error("Failed to fetch calendar slots");
      return res.json();
    },
    enabled: !!selectedArtistId,
  });

  // Transform to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return calendarSlots.map((slot) => ({
      id: slot.id,
      title: slot.title,
      start: new Date(slot.scheduledAt),
      end: new Date(new Date(slot.scheduledAt).getTime() + 60 * 60 * 1000), // 1 hour duration
      resource: slot,
    }));
  }, [calendarSlots]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertCalendarSlot) => {
      await apiRequest("POST", "/api/calendar-slots", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-slots"] });
      setIsDialogOpen(false);
      setSelectedEvent(null);
      toast({
        title: "Evento criado!",
        description: "O agendamento foi criado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar evento",
        description: error.message || "Ocorreu um erro ao criar o agendamento.",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertCalendarSlot> }) => {
      await apiRequest("PATCH", `/api/calendar-slots/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-slots"] });
      setIsDialogOpen(false);
      setSelectedEvent(null);
      toast({
        title: "Evento atualizado!",
        description: "O agendamento foi atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar evento",
        description: error.message || "Ocorreu um erro ao atualizar o agendamento.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/calendar-slots/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-slots"] });
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      toast({
        title: "Evento removido!",
        description: "O agendamento foi removido com sucesso.",
      });
    },
    onError: (error: any) => {
      setDeleteDialogOpen(true);
      toast({
        title: "Erro ao remover evento",
        description: error.message || "Ocorreu um erro ao remover o agendamento.",
        variant: "destructive",
      });
    },
  });

  // Handle slot selection (create new event)
  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    const now = new Date();
    setSelectedEvent({
      id: "",
      artistId: selectedArtistId || "",
      title: "",
      contentType: "Reels",
      status: "Planejado",
      scheduledAt: slotInfo.start,
      brief: "",
      createdAt: now,
    } as CalendarSlot);
    setIsDialogOpen(true);
  }, [selectedArtistId]);

  // Handle event selection (edit event)
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event.resource);
    setIsDialogOpen(true);
  }, []);

  // Handle delete
  const handleDelete = () => {
    if (selectedEvent && selectedEvent.id) {
      setEventToDelete(selectedEvent);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      deleteMutation.mutate(eventToDelete.id);
    }
  };

  // Event style getter (color-coding by status)
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const backgroundColor = statusColors[event.resource.status] || "#6366f1";
    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.9,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  }, []);

  if (!selectedArtistId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Selecione um artista para ver o calendário</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2" data-testid="text-page-title">
              <CalendarIcon className="w-8 h-8" />
              Calendar & Planning
            </h1>
            <p className="text-muted-foreground" data-testid="text-page-description">
              Gerencie agendamentos de conteúdo e tarefas
            </p>
          </div>
        </div>

        {/* Calendar */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="bg-card rounded-lg p-4" style={{ height: "calc(100vh - 200px)" }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              selectable
              eventPropGetter={eventStyleGetter}
              views={["month", "week"]}
              messages={{
                month: "Mês",
                week: "Semana",
                day: "Dia",
                today: "Hoje",
                previous: "Anterior",
                next: "Próximo",
                showMore: (total) => `+${total} mais`,
              }}
            />
          </div>
        )}

        {/* Event Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedEvent?.id ? "Editar Agendamento" : "Novo Agendamento"}
              </DialogTitle>
              <DialogDescription>
                {selectedEvent?.id
                  ? "Atualize as informações do evento"
                  : "Crie um novo evento no calendário"}
              </DialogDescription>
            </DialogHeader>
            {selectedEvent && (
              <EventForm
                event={selectedEvent}
                onSubmit={(data) => {
                  if (selectedEvent.id) {
                    updateMutation.mutate({ id: selectedEvent.id, data });
                  } else {
                    createMutation.mutate({ ...data, artistId: selectedArtistId });
                  }
                }}
                onDelete={handleDelete}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover o evento "{eventToDelete?.title}"?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                data-testid="button-cancel-delete"
                disabled={deleteMutation.isPending}
              >
                Cancelar
              </AlertDialogCancel>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  confirmDelete();
                }}
                disabled={deleteMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Removendo...
                  </>
                ) : (
                  "Remover"
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// Event Form Component
interface EventFormProps {
  event: CalendarSlot;
  onSubmit: (data: InsertCalendarSlot) => void;
  onDelete?: () => void;
  isSubmitting: boolean;
}

function EventForm({ event, onSubmit, onDelete, isSubmitting }: EventFormProps) {
  const form = useForm<InsertCalendarSlot>({
    resolver: zodResolver(insertCalendarSlotSchema.omit({ artistId: true })),
    defaultValues: {
      title: event.title || "",
      contentType: event.contentType || "Reels",
      status: event.status || "Planejado",
      scheduledAt: event.scheduledAt ? new Date(event.scheduledAt) : new Date(),
      brief: event.brief || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ex: Teaser novo single"
                  data-testid="input-title"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Conteúdo *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-content-type">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {contentTypes.map((type) => (
                      <SelectItem key={type} value={type} data-testid={`option-${type}`}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem
                        key={status}
                        value={status}
                        data-testid={`option-${status}`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: statusColors[status] }}
                          />
                          {status}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="scheduledAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data e Hora *</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  value={moment(field.value).format("YYYY-MM-DDTHH:mm")}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                  data-testid="input-scheduled-at"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brief"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Briefing</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ""}
                  placeholder="Descreva o conteúdo planejado..."
                  rows={4}
                  data-testid="input-brief"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between gap-2 pt-4">
          {event.id && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isSubmitting}
              data-testid="button-delete-event"
            >
              Remover
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button
              type="submit"
              disabled={isSubmitting}
              data-testid="button-submit-event"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
