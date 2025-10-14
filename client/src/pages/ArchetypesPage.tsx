import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRealityArchetypeSchema, type RealityArchetype, type InsertRealityArchetype } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const entityTypeLabels: Record<string, string> = {
  location: "📍 Localização",
  character: "👤 Personagem",
  possession: "💎 Posse",
  concept: "💡 Conceito",
};

export default function ArchetypesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingArchetype, setEditingArchetype] = useState<RealityArchetype | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archetypeToDelete, setArchetypeToDelete] = useState<RealityArchetype | null>(null);
  const { toast } = useToast();

  // Fetch archetypes
  const { data: archetypes = [], isLoading } = useQuery<RealityArchetype[]>({
    queryKey: ["/api/admin/archetypes"],
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertRealityArchetype) => {
      const result = await apiRequest("POST", "/api/admin/archetypes", data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/archetypes"] });
      setIsCreateOpen(false);
      toast({
        title: "Arquétipo criado!",
        description: "O template foi criado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar arquétipo",
        description: error.message || "Ocorreu um erro ao criar o template.",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertRealityArchetype> }) => {
      const result = await apiRequest("PATCH", `/api/admin/archetypes/${id}`, data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/archetypes"] });
      setEditingArchetype(null);
      toast({
        title: "Arquétipo atualizado!",
        description: "O template foi atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar arquétipo",
        description: error.message || "Ocorreu um erro ao atualizar o template.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/archetypes/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/archetypes"] });
      setDeleteDialogOpen(false);
      setArchetypeToDelete(null);
      toast({
        title: "Arquétipo removido!",
        description: "O template foi removido com sucesso.",
      });
    },
    onError: (error: any) => {
      // Keep dialog open on error
      setDeleteDialogOpen(true);
      toast({
        title: "Erro ao remover arquétipo",
        description: error.message || "Ocorreu um erro ao remover o template.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (archetype: RealityArchetype) => {
    setArchetypeToDelete(archetype);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (archetypeToDelete) {
      deleteMutation.mutate(archetypeToDelete.id);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
              Arquétipos de Entidade
            </h1>
            <p className="text-muted-foreground" data-testid="text-page-description">
              Templates para criação rápida de entidades comuns no Reality Engine
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-archetype">
                <Plus className="w-4 h-4 mr-2" />
                Criar Arquétipo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Arquétipo</DialogTitle>
                <DialogDescription>
                  Defina um template para criação de entidades comuns
                </DialogDescription>
              </DialogHeader>
              <ArchetypeForm
                onSubmit={(data) => createMutation.mutate(data)}
                isSubmitting={createMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && archetypes.length === 0 && (
          <div className="text-center py-12" data-testid="empty-state">
            <p className="text-muted-foreground mb-4">
              Nenhum arquétipo criado ainda. Clique em "Criar Arquétipo" para começar.
            </p>
          </div>
        )}

        {/* Archetypes Grid */}
        {!isLoading && archetypes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archetypes.map((archetype) => (
              <div
                key={archetype.id}
                className="border border-border rounded-lg p-4 bg-card hover:border-primary/50 transition-colors"
                data-testid={`card-archetype-${archetype.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {archetype.icon && (
                      <span className="text-2xl" data-testid={`icon-${archetype.id}`}>
                        {archetype.icon}
                      </span>
                    )}
                    <div>
                      <h3
                        className="font-semibold text-lg"
                        data-testid={`text-name-${archetype.id}`}
                      >
                        {archetype.name}
                      </h3>
                      <p
                        className="text-xs text-muted-foreground"
                        data-testid={`text-type-${archetype.id}`}
                      >
                        {entityTypeLabels[archetype.entityType] || archetype.entityType}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingArchetype(archetype)}
                      data-testid={`button-edit-${archetype.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(archetype)}
                      data-testid={`button-delete-${archetype.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {archetype.description && (
                  <p
                    className="text-sm text-muted-foreground line-clamp-2"
                    data-testid={`text-description-${archetype.id}`}
                  >
                    {archetype.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingArchetype} onOpenChange={(open) => !open && setEditingArchetype(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Arquétipo</DialogTitle>
              <DialogDescription>
                Atualize as informações do template
              </DialogDescription>
            </DialogHeader>
            {editingArchetype && (() => {
              // Validate entityType and fallback to 'location' if invalid
              const validEntityTypes = ['location', 'character', 'possession', 'concept'] as const;
              const entityType = validEntityTypes.includes(editingArchetype.entityType as any)
                ? (editingArchetype.entityType as typeof validEntityTypes[number])
                : 'location';
              
              return (
                <ArchetypeForm
                  defaultValues={{
                    name: editingArchetype.name,
                    entityType,
                    description: editingArchetype.description,
                    icon: editingArchetype.icon,
                  }}
                  onSubmit={(data) => updateMutation.mutate({ id: editingArchetype.id, data })}
                  isSubmitting={updateMutation.isPending}
                />
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover o arquétipo "{archetypeToDelete?.name}"?
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

// Archetype Form Component
interface ArchetypeFormProps {
  defaultValues?: Partial<InsertRealityArchetype>;
  onSubmit: (data: InsertRealityArchetype) => void;
  isSubmitting: boolean;
}

function ArchetypeForm({ defaultValues, onSubmit, isSubmitting }: ArchetypeFormProps) {
  const form = useForm<InsertRealityArchetype>({
    resolver: zodResolver(insertRealityArchetypeSchema),
    defaultValues: defaultValues || {
      name: "",
      entityType: "location",
      description: "",
      icon: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ex: Produtor Musical"
                  data-testid="input-name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="entityType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Entidade *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-entity-type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="location" data-testid="option-location">
                    📍 Localização
                  </SelectItem>
                  <SelectItem value="character" data-testid="option-character">
                    👤 Personagem
                  </SelectItem>
                  <SelectItem value="possession" data-testid="option-possession">
                    💎 Posse
                  </SelectItem>
                  <SelectItem value="concept" data-testid="option-concept">
                    💡 Conceito
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ícone (Emoji)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  placeholder="Ex: 🎤"
                  maxLength={4}
                  data-testid="input-icon"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ""}
                  placeholder="Descreva o propósito deste arquétipo..."
                  rows={3}
                  data-testid="input-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            data-testid="button-submit-archetype"
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
      </form>
    </Form>
  );
}
