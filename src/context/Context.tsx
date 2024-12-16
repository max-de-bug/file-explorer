import { invoke } from "@tauri-apps/api/core";
import { createContext, useState, ReactNode, useEffect } from "react";

// Define the context's type
interface AppContextType {
  disks: string[]; // disks will be an array of strings
  fetchDisks: () => void; // fetchDisks is a function
}

// Create the context with a default value that matches AppContextType
export const AppContext = createContext<AppContextType>({
  disks: [], // Default value for disks as an empty array
  fetchDisks: () => {}, // Default value for fetchDisks as an empty function
});

// Create a Provider component that will wrap around your app
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [disks, setDisks] = useState<string[]>([]); // State for disks (array of strings)

  // Function to fetch disks from the backend using Tauri
  async function fetchDisks() {
    try {
      const result = await invoke<string[]>("list_disks"); // Call the Tauri API
      setDisks(result || []); // Set disks state to the result or an empty array if there's no result
    } catch (error) {
      console.error("Error fetching disks:", error); // Handle errors if any
    }
  }

  // useEffect ensures fetchDisks is only called once on component mount
  useEffect(() => {
    fetchDisks();
  }, []); // Empty dependency array means it only runs once when the component mounts

  return (
    <AppContext.Provider value={{ disks, fetchDisks }}>
      {children}
    </AppContext.Provider>
  );
};
