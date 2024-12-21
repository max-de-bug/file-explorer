import { invoke } from "@tauri-apps/api/core";
import { createContext, useState, ReactNode, useEffect } from "react";

// Define the context's type

type File = {
  name: string;
  date: string;
  size: string;
};
interface AppContextType {
  disks: string[];
  fetchDisks: () => void;
  downloads: File[] | null;
  fetchDownloads: () => void;
}

export const AppContext = createContext<AppContextType>({
  disks: [],
  fetchDisks: () => {},
  downloads: [],
  fetchDownloads: () => {},
});

// Create a Provider component that will wrap around your app
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [disks, setDisks] = useState<string[]>([]);
  const [downloads, setDownloads] = useState<File[] | null>(null);
  async function fetchDisks() {
    try {
      const result = await invoke<string[]>("list_disks");
      setDisks(result || []);
    } catch (error) {
      console.error("Error fetching disks:", error);
    }
  }
  async function fetchDownloads() {
    try {
      // Assuming `list_downloads` now returns File[] from the Tauri backend
      const result = await invoke<File[]>("list_downloads");
      setDownloads(result || null); // Update state with File[] or null
    } catch (error) {
      console.error("Error fetching downloads:", error);
    }
  }
  useEffect(() => {
    fetchDisks();
    fetchDownloads();
  }, []);

  return (
    <AppContext.Provider
      value={{ disks, fetchDisks, downloads, fetchDownloads }}
    >
      {children}
    </AppContext.Provider>
  );
};
