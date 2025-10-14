import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Artist } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, ArrowLeft, Sparkles, Image as ImageIcon, Upload } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const artistDnaSchema = z.object({
  // Identidade & Físico
  nome: z.string().optional(),
  genero: z.string().optional(),
  idade: z.string().optional(),
  formatoRosto: z.string().optional(),
  tomPele: z.string().optional(),
  corOlhos: z.string().optional(),
  formatoSobrancelhas: z.string().optional(),
  formatoNariz: z.string().optional(),
  labios: z.string().optional(),
  cabelo: z.string().optional(),
  altura: z.string().optional(),
  tipoCorpo: z.string().optional(),
  tatuagens: z.string().optional(),
  
  // Voz & Estilo
  idioma: z.string().optional(),
  sotaque: z.string().optional(),
  texturaVoz: z.string().optional(),
  tomVoz: z.string().optional(),
  estiloRoupa: z.string().optional(),
  paletaCores: z.string().optional(),
  acessorios: z.string().optional(),
  
  // Diretrizes de Mídia
  locaisComuns: z.string().optional(),
  iluminacaoPreferida: z.string().optional(),
  decoracao: z.string().optional(),
  formatoCamera: z.string().optional(),
  enquadramento: z.string().optional(),
  movimentoCamera: z.string().optional(),
  
  // Lore & Personalidade
  lore: z.string().optional(),
  carismatico: z.string().optional(),
  sedutor: z.string().optional(),
  talentoso: z.string().optional(),
});

type ArtistDNA = z.infer<typeof artistDnaSchema>;

export default function ArtistProfilePage() {
  const params = useParams();
  const artistId = params.id as string;
  const { toast } = useToast();
  const [loreConcept, setLoreConcept] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const { data: artist, isLoading } = useQuery<Artist>({
    queryKey: ["/api/artists", artistId],
  });

  const form = useForm<ArtistDNA>({
    resolver: zodResolver(artistDnaSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (artist?.dna) {
      form.reset(artist.dna);
    }
  }, [artist?.dna]);

  const updateArtistMutation = useMutation({
    mutationFn: async (data: ArtistDNA) => {
      return apiRequest("PATCH", `/api/artists/${artistId}`, {
        dna: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artists", artistId] });
      queryClient.invalidateQueries({ queryKey: ["/api/artists"] });
      toast({
        title: "Alterações salvas!",
        description: "O DNA do artista foi atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const generateLoreMutation = useMutation({
    mutationFn: async (): Promise<{ lore: string }> => {
      const concept = loreConcept || artist?.name || "um artista";
      const response = await apiRequest("POST", "/api/ai/generate-lore", { concept });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      form.setValue("lore", data.lore, { 
        shouldDirty: true, 
        shouldTouch: true, 
        shouldValidate: true 
      });
      
      toast({
        title: "LORE gerada com sucesso!",
        description: "A história foi criada pela IA. Revise e edite se necessário.",
      });
      setLoreConcept("");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao gerar LORE",
        description: error.message || "Verifique se a chave da API está configurada em Settings.",
        variant: "destructive",
      });
    },
  });

  const analyzeImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao analisar imagem');
      }
      
      return await response.json();
    },
    onSuccess: (extractedData) => {
      // Populate form fields with extracted data
      Object.keys(extractedData).forEach((key) => {
        if (extractedData[key]) {
          form.setValue(key as any, extractedData[key], {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }
      });
      
      toast({
        title: "DNA extraído com sucesso!",
        description: "Os campos foram preenchidos com os dados da imagem. Revise e ajuste conforme necessário.",
      });
      setSelectedImage(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao analisar imagem",
        description: error.message || "Não foi possível analisar a imagem. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ArtistDNA) => {
    updateArtistMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando perfil do artista...</p>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Artista não encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/artists">
            <Button variant="outline" size="icon" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-semibold" data-testid="text-artist-name">
              {artist.name}
            </h1>
            <p className="text-muted-foreground">DNA do Artista</p>
          </div>
        </div>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={updateArtistMutation.isPending}
          data-testid="button-save"
        >
          <Save className="h-4 w-4 mr-2" />
          {updateArtistMutation.isPending ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="identidade" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="identidade" data-testid="tab-identidade">
                Identidade & Físico
              </TabsTrigger>
              <TabsTrigger value="voz" data-testid="tab-voz">
                Voz & Estilo
              </TabsTrigger>
              <TabsTrigger value="midia" data-testid="tab-midia">
                Diretrizes de Mídia
              </TabsTrigger>
              <TabsTrigger value="lore" data-testid="tab-lore">
                Lore & Personalidade
              </TabsTrigger>
            </TabsList>

            <TabsContent value="identidade" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Identidade & Características Físicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* AI Image Analysis Section */}
                  <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-muted">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold">Extrair DNA de Imagem de Referência</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Faça upload de uma foto para extrair automaticamente as características físicas usando IA
                    </p>
                    <div className="flex gap-3">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedImage(file);
                          }
                        }}
                        data-testid="input-image-upload"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          if (selectedImage) {
                            analyzeImageMutation.mutate(selectedImage);
                          }
                        }}
                        disabled={!selectedImage || analyzeImageMutation.isPending}
                        data-testid="button-analyze-image"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {analyzeImageMutation.isPending ? "Analisando..." : "Analisar Imagem"}
                      </Button>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do artista" {...field} data-testid="input-nome" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="genero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gênero</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Feminino, Masculino, Não-binário" {...field} data-testid="input-genero" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="idade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Idade</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 25 anos" {...field} data-testid="input-idade" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="formatoRosto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Formato do Rosto</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Oval, Quadrado, Redondo" {...field} data-testid="input-formato-rosto" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tomPele"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tom de Pele</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Claro, Médio, Escuro" {...field} data-testid="input-tom-pele" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="corOlhos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor dos Olhos</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Castanhos, Azuis, Verdes" {...field} data-testid="input-cor-olhos" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="formatoSobrancelhas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Formato das Sobrancelhas</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Arqueadas, Retas, Finas" {...field} data-testid="input-sobrancelhas" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="formatoNariz"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Formato do Nariz</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Fino, Largo, Arrebitado" {...field} data-testid="input-nariz" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="labios"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lábios</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Carnudos, Finos, Médios" {...field} data-testid="input-labios" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cabelo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cabelo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Longo e preto, Curto e loiro" {...field} data-testid="input-cabelo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="altura"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Altura</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 1.75m" {...field} data-testid="input-altura" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tipoCorpo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Corpo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Atlético, Magro, Curvilíneo" {...field} data-testid="input-tipo-corpo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tatuagens"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Tatuagens</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Descreva as tatuagens do artista..." {...field} data-testid="input-tatuagens" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="voz" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Voz & Estilo Visual</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="idioma"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Idioma</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Português, Inglês" {...field} data-testid="input-idioma" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sotaque"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sotaque</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Carioca, Paulista, Neutro" {...field} data-testid="input-sotaque" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="texturaVoz"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Textura da Voz</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Rouca, Suave, Aveludada" {...field} data-testid="input-textura-voz" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tomVoz"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tom da Voz</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Grave, Agudo, Médio" {...field} data-testid="input-tom-voz" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="estiloRoupa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estilo de Roupa</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Streetwear, Elegante, Casual" {...field} data-testid="input-estilo-roupa" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paletaCores"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Paleta de Cores</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Tons escuros, Cores vibrantes" {...field} data-testid="input-paleta-cores" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="acessorios"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Acessórios</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Descreva os acessórios característicos..." {...field} data-testid="input-acessorios" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="midia" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Diretrizes de Mídia & Produção</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="locaisComuns"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Locais Comuns</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Estúdio urbano, Locais ao ar livre" {...field} data-testid="input-locais" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="iluminacaoPreferida"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Iluminação Preferida</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Neon, Natural, Dramática" {...field} data-testid="input-iluminacao" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="decoracao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Decoração</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Minimalista, Industrial, Vintage" {...field} data-testid="input-decoracao" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="formatoCamera"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Formato de Câmera</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 16:9, 9:16 (vertical), 1:1" {...field} data-testid="input-formato-camera" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="enquadramento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enquadramento</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Close-up, Plano médio, Plano geral" {...field} data-testid="input-enquadramento" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="movimentoCamera"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Movimento de Câmera</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Estático, Traveling, Drone" {...field} data-testid="input-movimento-camera" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lore" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>História & Personalidade</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-muted">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      <span className="font-semibold">Gerar LORE com IA</span>
                    </div>
                    <Input
                      placeholder="Digite um conceito ou deixe em branco para usar o nome do artista..."
                      value={loreConcept}
                      onChange={(e) => setLoreConcept(e.target.value)}
                      data-testid="input-lore-concept"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => generateLoreMutation.mutate()}
                      disabled={generateLoreMutation.isPending}
                      data-testid="button-generate-lore"
                      className="w-full"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {generateLoreMutation.isPending ? "Gerando..." : "Gerar LORE com IA"}
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name="lore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LORE (História de fundo)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Conte a história completa do artista: origem, motivações, jornada, marcos importantes..."
                            className="min-h-[200px]"
                            value={field.value || ''}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                            data-testid="input-lore"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="carismatico"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Carismático</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Alto, Médio, Baixo" {...field} data-testid="input-carismatico" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sedutor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sedutor</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Alto, Médio, Baixo" {...field} data-testid="input-sedutor" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="talentoso"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Talentoso</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Alto, Médio, Baixo" {...field} data-testid="input-talentoso" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
