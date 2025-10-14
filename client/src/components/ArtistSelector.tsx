import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { useArtist } from "@/contexts/ArtistContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Artist {
  id: string;
  name: string;
  genre?: string;
}

export function ArtistSelector() {
  const { selectedArtistId, setSelectedArtistId } = useArtist();
  const [open, setOpen] = useState(false);

  const { data: artists = [], isLoading } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
  });

  // Auto-select first artist if none is selected
  useEffect(() => {
    if (!selectedArtistId && artists.length > 0) {
      setSelectedArtistId(artists[0].id);
    }
  }, [artists, selectedArtistId, setSelectedArtistId]);

  const selectedArtist = artists.find((artist) => artist.id === selectedArtistId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <User className="h-4 w-4" />
        <span>Carregando...</span>
      </div>
    );
  }

  if (artists.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <User className="h-4 w-4" />
        <span>Nenhum artista</span>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[280px] justify-between"
          data-testid="button-artist-selector"
        >
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="truncate">
              {selectedArtist ? selectedArtist.name : "Selecione um artista"}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Buscar artista..." />
          <CommandList>
            <CommandEmpty>Nenhum artista encontrado.</CommandEmpty>
            <CommandGroup>
              {artists.map((artist) => (
                <CommandItem
                  key={artist.id}
                  value={artist.name}
                  onSelect={() => {
                    setSelectedArtistId(artist.id);
                    setOpen(false);
                  }}
                  data-testid={`artist-option-${artist.id}`}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedArtistId === artist.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{artist.name}</span>
                    {artist.genre && (
                      <span className="text-xs text-muted-foreground">{artist.genre}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
