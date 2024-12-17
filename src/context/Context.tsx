import { invoke } from "@tauri-apps/api/core";
import { createContext, useState, ReactNode, useEffect } from "react";

// Define the context's type
interface AppContextType {
  disks: string[];
  fetchDisks: () => void;
  dowloads: string[];
  fetchDowloads: () => void;
}

export const AppContext = createContext<AppContextType>({
  disks: [],
  fetchDisks: () => {},
  dowloads: [],
  fetchDowloads: () => {},
});

// Create a Provider component that will wrap around your app
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [disks, setDisks] = useState<string[]>([]);
  const [dowloads, setDowloads] = useState<string[]>([]);
  async function fetchDisks() {
    try {
      const result = await invoke<string[]>("list_disks");
      setDisks(result || []);
    } catch (error) {
      console.error("Error fetching disks:", error);
    }
  }
  async function fetchDowloads() {
    try {
      const result = await invoke<string[]>("list_dowloads");
      setDowloads(result || []);
    } catch (error) {
      console.error("Error fetching disks:", error);
    }
  }
  useEffect(() => {
    fetchDisks();
    fetchDowloads();
  }, []);

  return (
    <AppContext.Provider value={{ disks, fetchDisks, dowloads, fetchDowloads }}>
      {children}
    </AppContext.Provider>
  );
};
