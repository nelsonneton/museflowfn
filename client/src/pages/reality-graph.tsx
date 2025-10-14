import { useCallback, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { RealityNode, RealityRelationship } from "@shared/schema";
import { useArtist } from "@/contexts/ArtistContext";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Network, MapPin, User, Package, Lightbulb, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const entityTypes = ["location", "character", "possession", "concept"];

const nodeTypeIcons = {
  location: MapPin,
  character: User,
  possession: Package,
  concept: Lightbulb,
};

const nodeTypeColors = {
  location: '#10b981',
  character: '#3b82f6',
  possession: '#f59e0b',
  concept: '#8b5cf6',
};

const nodeFormSchema = z.object({
  type: z.enum(["location", "character", "possession", "concept"]),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
});

type NodeFormData = z.infer<typeof nodeFormSchema>;

// Custom Node Component with Delete Button
function CustomNode({ data }: { data: any }) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <div className="flex items-center gap-2 pr-6">
        {data.icon}
        <span>{data.label}</span>
      </div>
      <button
        onClick={data.onDelete}
        className={`absolute top-1/2 -translate-y-1/2 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 hover:bg-destructive/90 transition-all z-[1000] shadow-lg ${showDelete ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}
        data-testid={`button-delete-node-${data.nodeId}`}
        style={{ pointerEvents: showDelete ? 'auto' : 'none' }}
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

export default function RealityGraph() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(entityTypes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();
  
  // Get selected artist from global context
  const { selectedArtistId } = useArtist();

  const { data: realityNodes = [], isLoading: isLoadingNodes } = useQuery<RealityNode[]>({
    queryKey: ["/api/reality-nodes", selectedArtistId],
    enabled: !!selectedArtistId,
    queryFn: async () => {
      if (!selectedArtistId) return [];
      const response = await fetch(`/api/reality-nodes?artistId=${selectedArtistId}`);
      if (!response.ok) throw new Error('Failed to fetch nodes');
      return response.json();
    }
  });

  const { data: relationships = [], isLoading: isLoadingRelationships } = useQuery<RealityRelationship[]>({
    queryKey: ["/api/reality-relationships"],
  });

  const form = useForm<NodeFormData>({
    resolver: zodResolver(nodeFormSchema),
    defaultValues: {
      type: "location",
      name: "",
      description: "",
    },
  });

  const createNodeMutation = useMutation({
    mutationFn: async (data: NodeFormData) => {
      if (!selectedArtistId) throw new Error("No artist selected");
      // Generate random position only on creation (not on refetch)
      const randomPosition = {
        x: Math.random() * 600 + 100,
        y: Math.random() * 400 + 100
      };
      return apiRequest("POST", "/api/reality-nodes", {
        artistId: selectedArtistId,
        type: data.type,
        name: data.name,
        description: data.description,
        attributes: {},
        position: randomPosition,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reality-nodes", selectedArtistId] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Node criado!",
        description: "O node foi adicionado ao Reality Graph.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao criar node",
        description: "Não foi possível criar o node. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateNodePositionMutation = useMutation({
    mutationFn: async ({ id, position }: { id: string; position: { x: number; y: number } }) => {
      return apiRequest("PATCH", `/api/reality-nodes/${id}`, { position });
    },
    onSuccess: () => {
      // Invalidate cache to update node positions
      queryClient.invalidateQueries({ queryKey: ["/api/reality-nodes", selectedArtistId] });
    },
  });

  const createRelationshipMutation = useMutation({
    mutationFn: async (data: { fromNodeId: string; toNodeId: string }) => {
      return apiRequest("POST", "/api/reality-relationships", {
        ...data,
        relationshipType: "related_to",
        strength: 5,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reality-relationships"] });
      toast({
        title: "Relacionamento criado!",
        description: "A conexão entre os nodes foi estabelecida.",
      });
    },
  });

  const deleteNodeMutation = useMutation({
    mutationFn: async (nodeId: string) => {
      return apiRequest("DELETE", `/api/reality-nodes/${nodeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reality-nodes", selectedArtistId] });
      queryClient.invalidateQueries({ queryKey: ["/api/reality-relationships"] });
      setNodeToDelete(null);
      toast({
        title: "Node deletado!",
        description: "O node e suas conexões foram removidos do Reality Graph.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao deletar node",
        description: "Não foi possível deletar o node. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Convert Reality Nodes to React Flow nodes
  const flowNodes: Node[] = realityNodes
    .filter(node => selectedTypes.includes(node.type))
    .map(node => {
      const Icon = nodeTypeIcons[node.type as keyof typeof nodeTypeIcons];
      // Only use random position if no position is stored
      const position = node.position ?? { x: 0, y: 0 };
      return {
        id: node.id,
        type: 'custom',
        position,
        data: { 
          icon: <Icon className="h-4 w-4" />,
          label: node.name,
          nodeId: node.id,
          onDelete: (e: any) => {
            e.stopPropagation();
            setNodeToDelete({ id: node.id, name: node.name });
          }
        },
        style: {
          background: nodeTypeColors[node.type as keyof typeof nodeTypeColors],
          color: 'white',
          border: '2px solid #fff',
          borderRadius: '8px',
          padding: '10px',
          fontSize: '12px',
          fontWeight: 'bold',
        },
      };
    });

  // Get IDs of visible nodes
  const visibleNodeIds = new Set(flowNodes.map(n => n.id));

  // Convert Reality Relationships to React Flow edges (filtered by visible nodes)
  const flowEdges: Edge[] = relationships
    .filter(rel => visibleNodeIds.has(rel.fromNodeId) && visibleNodeIds.has(rel.toNodeId))
    .map(rel => ({
      id: rel.id,
      source: rel.fromNodeId,
      target: rel.toNodeId,
      label: rel.relationshipType,
      animated: true,
      style: { stroke: '#64748b', strokeWidth: rel.strength / 2 },
    }));

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // Update flow when data changes
  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [realityNodes, relationships, selectedTypes, setNodes, setEdges]);

  const onConnect = useCallback((params: Connection) => {
    if (params.source && params.target) {
      createRelationshipMutation.mutate({
        fromNodeId: params.source,
        toNodeId: params.target,
      });
    }
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges, createRelationshipMutation]);

  const onNodeDragStop = useCallback((event: any, node: Node) => {
    updateNodePositionMutation.mutate({
      id: node.id,
      position: node.position,
    });
  }, [updateNodePositionMutation]);

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const onSubmit = (data: NodeFormData) => {
    createNodeMutation.mutate(data);
  };

  if (!selectedArtistId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Selecione um artista no menu acima para começar.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-4 p-6 border-b">
        <div>
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">Reality Graph</h1>
          <p className="text-muted-foreground">Visualize and manage narrative consistency</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-entity">
              <Plus className="h-4 w-4 mr-2" />
              Add Entity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Reality Node</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-node-type">
                            <SelectValue placeholder="Select entity type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="location">Location</SelectItem>
                          <SelectItem value="character">Character</SelectItem>
                          <SelectItem value="possession">Possession</SelectItem>
                          <SelectItem value="concept">Concept</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter entity name" {...field} data-testid="input-node-name" />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter description..." {...field} data-testid="input-node-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createNodeMutation.isPending} data-testid="button-save-node">
                    {createNodeMutation.isPending ? "Creating..." : "Create Node"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 grid lg:grid-cols-[280px_1fr]">
        <Card className="border-r border-t-0 rounded-none">
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Entity Types</h4>
              <div className="space-y-2">
                {entityTypes.map((type) => (
                  <div key={type} className="flex items-center gap-2">
                    <Checkbox
                      id={`filter-${type}`}
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={() => toggleType(type)}
                      data-testid={`checkbox-filter-${type}`}
                    />
                    <label
                      htmlFor={`filter-${type}`}
                      className="text-sm capitalize cursor-pointer flex items-center gap-2"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: nodeTypeColors[type as keyof typeof nodeTypeColors] }}
                      />
                      {type}s
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex gap-2">
                <Badge variant="outline">{realityNodes.length} Nodes</Badge>
                <Badge variant="outline">{relationships.length} Links</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="relative">
          {isLoadingNodes || isLoadingRelationships ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading graph...</p>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeDragStop={onNodeDragStop}
              nodeTypes={nodeTypes}
              fitView
            >
              <Controls />
              <MiniMap 
                nodeColor={(node) => {
                  const realityNode = realityNodes.find(n => n.id === node.id);
                  return realityNode ? nodeTypeColors[realityNode.type as keyof typeof nodeTypeColors] : '#64748b';
                }}
              />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
              <Panel position="top-right" className="bg-background/80 backdrop-blur-sm rounded-lg p-3 border">
                <div className="text-sm space-y-1">
                  <p className="font-medium">💡 Quick Tips:</p>
                  <p className="text-muted-foreground">• Drag nodes to reposition</p>
                  <p className="text-muted-foreground">• Connect nodes to create relationships</p>
                  <p className="text-muted-foreground">• Use filters to focus on specific types</p>
                </div>
              </Panel>
            </ReactFlow>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!nodeToDelete} onOpenChange={() => setNodeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Node</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar "{nodeToDelete?.name}"? Esta ação não pode ser desfeita e todos os relacionamentos associados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => nodeToDelete && deleteNodeMutation.mutate(nodeToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteNodeMutation.isPending ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
