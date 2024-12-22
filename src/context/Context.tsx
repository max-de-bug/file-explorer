import { invoke } from "@tauri-apps/api/core";
import { createContext, useState, ReactNode, useEffect } from "react";

// Define the FileInfo type
interface FileInfo {
  file_name: string;
  file_size: number;
  modification_date: string;
}

// Define the context's type
interface AppContextType {
  disks: string[];
  fetchDisks: () => void;
  downloads: FileInfo[]; // Use FileInfo[] to type the downloads
  fetchDownloads: () => void;
  documents: FileInfo[]; // Use FileInfo[] here as well
  fetchDocuments: () => void;
}

export const AppContext = createContext<AppContextType>({
  disks: [],
  fetchDisks: () => {},
  downloads: [],
  fetchDownloads: () => {},
  documents: [],
  fetchDocuments: () => {},
});

// Create a Provider component that will wrap around your app
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [disks, setDisks] = useState<string[]>([]); // Correct type for disks
  const [downloads, setDownloads] = useState<FileInfo[]>([]); // Correct type for downloads
  const [documents, setDocuments] = useState<FileInfo[]>([]); // Correct type for documents

  async function fetchDisks() {
    try {
      const result = await invoke<string[]>("list_disks");
      setDisks(result || []); // Correctly set the disks state
    } catch (error) {
      console.error("Error fetching disks:", error);
    }
  }

  async function fetchDownloads() {
    try {
      // Assuming `list_downloads` now returns an array of FileInfo from the backend
      const result = await invoke<FileInfo[]>("list_downloads");
      setDownloads(result || []); // Correctly set the downloads state
      console.log("result", result);
    } catch (error) {
      console.error("Error fetching downloads:", error);
    }
  }

  async function fetchDocuments() {
    try {
      // Assuming `list_documents` now returns an array of FileInfo from the backend
      const result = await invoke<FileInfo[]>("list_documents");
      setDocuments(result || []); // Correctly set the documents state
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  }

  useEffect(() => {
    fetchDisks();
    fetchDownloads();
    fetchDocuments(); // Ensure this fetches documents
  }, []);

  return (
    <AppContext.Provider
      value={{
        disks,
        fetchDisks,
        downloads,
        fetchDownloads,
        documents, // Make sure documents are passed correctly
        fetchDocuments, // Add fetchDocuments to the context
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
