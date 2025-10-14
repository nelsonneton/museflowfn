import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Plus, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import type { TimelineEvent, RealityNode } from "@shared/schema";
import { insertTimelineEventSchema } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useArtist } from "@/contexts/ArtistContext";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const eventFormSchema = insertTimelineEventSchema.omit({ artistId: true });
type EventFormData = z.infer<typeof eventFormSchema>;

const eventTypes = [
  { value: "conquista", label: "Conquista" },
  { value: "lancamento", label: "Lançamento" },
  { value: "conflito", label: "Conflito" },
  { value: "encontro", label: "Encontro" },
  { value: "mudanca", label: "Mudança" },
  { value: "evento", label: "Evento Genérico" },
];

export default function TimelinePage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [, setLocation] = useLocation();
  
  // Get selected artist from global context
  const { selectedArtistId } = useArtist();

  // Fetch timeline events
  const { data: events = [], isLoading: isLoadingEvents } = useQuery<TimelineEvent[]>({
    queryKey: ["/api/timeline-events", selectedArtistId],
    queryFn: async () => {
      if (!selectedArtistId) return [];
      const response = await fetch(`/api/timeline-events?artistId=${selectedArtistId}`);
      if (!response.ok) throw new Error("Failed to fetch timeline events");
      return response.json();
    },
    enabled: !!selectedArtistId,
  });

  // Fetch reality nodes for linking
  const { data: realityNodes = [] } = useQuery<RealityNode[]>({
    queryKey: ["/api/reality-nodes", selectedArtistId],
    queryFn: async () => {
      if (!selectedArtistId) return [];
      const response = await fetch(`/api/reality-nodes?artistId=${selectedArtistId}`);
      if (!response.ok) throw new Error("Failed to fetch reality nodes");
      return response.json();
    },
    enabled: !!selectedArtistId,
  });

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      eventDate: new Date(),
      type: "evento",
      relatedNodes: [],
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      if (!selectedArtistId) throw new Error("No artist selected");
      return apiRequest("POST", "/api/timeline-events", {
        ...data,
        eventDate: new Date(data.eventDate).toISOString(),
        artistId: selectedArtistId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timeline-events", selectedArtistId] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Evento criado!",
        description: "O evento foi adicionado à timeline com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar evento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EventFormData> }) => {
      const payload = {
        ...data,
        ...(data.eventDate && { eventDate: new Date(data.eventDate).toISOString() })
      };
      return apiRequest("PATCH", `/api/timeline-events/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timeline-events", selectedArtistId] });
      setIsDialogOpen(false);
      setEditingEvent(null);
      form.reset();
      toast({
        title: "Evento atualizado!",
        description: "O evento foi atualizado com sucesso.",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/timeline-events/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timeline-events", selectedArtistId] });
      toast({
        title: "Evento deletado!",
        description: "O evento foi removido da timeline.",
      });
    },
  });

  const onSubmit = (data: EventFormData) => {
    if (editingEvent) {
      updateEventMutation.mutate({ id: editingEvent.id, data });
    } else {
      createEventMutation.mutate(data);
    }
  };

  const handleEdit = (event: TimelineEvent) => {
    setEditingEvent(event);
    form.reset({
      title: event.title,
      description: event.description || "",
      eventDate: new Date(event.eventDate),
      type: event.type,
      relatedNodes: event.relatedNodes || [],
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEvent(null);
    form.reset({
      title: "",
      description: "",
      eventDate: new Date(),
      type: "evento",
      relatedNodes: [],
    });
  };

  const getNodeTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      location: "bg-green-500",
      character: "bg-blue-500",
      possession: "bg-orange-500",
      concept: "bg-purple-500",
    };
    return colors[type] || "bg-gray-500";
  };

  const handlePlanOnCalendar = (event: TimelineEvent) => {
    const params = new URLSearchParams({
      title: event.title,
      date: new Date(event.eventDate).toISOString(),
    });
    setLocation(`/calendar?${params.toString()}`);
  };

  if (isLoadingEvents) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-muted-foreground">Carregando timeline...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Narrative Timeline</h1>
          <p className="text-muted-foreground">Linha do tempo cronológica dos eventos narrativos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (open) {
            setIsDialogOpen(true);
          } else {
            handleCloseDialog();
          }
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-event">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEvent ? "Editar Evento" : "Novo Evento"}</DialogTitle>
              <DialogDescription>
                {editingEvent 
                  ? "Edite os detalhes do evento narrativo"
                  : "Adicione um novo evento à timeline narrativa"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Primeiro Show, Mudança para NYC..." {...field} data-testid="input-event-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Evento</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-event-type">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {eventTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
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
                    name="eventDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data do Evento</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full pl-3 text-left font-normal"
                                data-testid="button-event-date"
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: ptBR })
                                ) : (
                                  <span>Selecione uma data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o que aconteceu neste evento..."
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ""}
                          data-testid="textarea-event-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="relatedNodes"
                  render={() => (
                    <FormItem>
                      <FormLabel>Entidades Relacionadas</FormLabel>
                      <FormControl>
                        <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto space-y-2">
                          {realityNodes.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              Nenhuma entidade disponível. Crie entidades no Reality Graph primeiro.
                            </p>
                          ) : (
                            realityNodes.map((node) => (
                              <FormField
                                key={node.id}
                                control={form.control}
                                name="relatedNodes"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={node.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(node.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), node.id])
                                              : field.onChange(
                                                  field.value?.filter((value) => value !== node.id)
                                                );
                                          }}
                                          data-testid={`checkbox-node-${node.id}`}
                                        />
                                      </FormControl>
                                      <div className="flex items-center gap-2">
                                        <Badge className={getNodeTypeColor(node.type)}>
                                          {node.type}
                                        </Badge>
                                        <span className="text-sm">{node.name}</span>
                                      </div>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                    data-testid="button-cancel-event"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createEventMutation.isPending || updateEventMutation.isPending}
                    data-testid="button-save-event"
                  >
                    {editingEvent ? "Atualizar" : "Criar"} Evento
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {events.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Nenhum evento na timeline ainda. Clique em "Adicionar Evento" para começar.
              </p>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => {
            const linkedNodes = realityNodes.filter((node) =>
              event.relatedNodes?.includes(node.id)
            );

            return (
              <Card key={event.id} data-testid={`card-event-${event.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{event.title}</CardTitle>
                        <Badge variant="outline">{event.type}</Badge>
                      </div>
                      <CardDescription>
                        {format(new Date(event.eventDate), "dd 'de' MMMM 'de' yyyy", {
                          locale: ptBR,
                        })}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePlanOnCalendar(event)}
                            data-testid={`button-plan-calendar-${event.id}`}
                          >
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Planejar no Calendário</p>
                        </TooltipContent>
                      </Tooltip>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(event)}
                        data-testid={`button-edit-${event.id}`}
                      >
                        Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-delete-${event.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deletar evento?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. O evento será permanentemente removido da timeline.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteEventMutation.mutate(event.id)}
                            >
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                  {linkedNodes.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Entidades envolvidas:</p>
                      <div className="flex flex-wrap gap-2">
                        {linkedNodes.map((node) => (
                          <Badge
                            key={node.id}
                            className={getNodeTypeColor(node.type)}
                            data-testid={`badge-linked-node-${node.id}`}
                          >
                            {node.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
