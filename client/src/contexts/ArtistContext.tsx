import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ArtistContextType {
  selectedArtistId: string | null;
  setSelectedArtistId: (id: string | null) => void;
}

const ArtistContext = createContext<ArtistContextType | undefined>(undefined);

export function ArtistProvider({ children }: { children: ReactNode }) {
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(() => {
    // Load from localStorage on mount
    return localStorage.getItem("selectedArtistId");
  });

  useEffect(() => {
    // Persist to localStorage whenever it changes
    if (selectedArtistId) {
      localStorage.setItem("selectedArtistId", selectedArtistId);
    } else {
      localStorage.removeItem("selectedArtistId");
    }
  }, [selectedArtistId]);

  return (
    <ArtistContext.Provider value={{ selectedArtistId, setSelectedArtistId }}>
      {children}
    </ArtistContext.Provider>
  );
}

export function useArtist() {
  const context = useContext(ArtistContext);
  if (context === undefined) {
    throw new Error("useArtist must be used within an ArtistProvider");
  }
  return context;
}
