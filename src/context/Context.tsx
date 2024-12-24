import { invoke } from "./../../node_modules/@tauri-apps/api/core";
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  ChangeEvent,
} from "react";

// Define the FileInfo type
interface FileInfo {
  file_name: string;
  file_size: number;
  modification_date: string;
}

// Define the AppContext type
interface AppContextType {
  disks: string[];
  files: number[];
  fetchDisks: () => Promise<void>;
  downloads: FileInfo[];
  fetchDownloads: () => Promise<void>;
  documents: FileInfo[];
  fetchDocuments: () => Promise<void>;
  handleBack: () => void;
  handleHome: () => void;
  fileCounter: () => Promise<void>;
  searchValue: string;
  handleSearch: (event: ChangeEvent<HTMLInputElement>) => void;
}

// Create the AppContext
export const AppContext = createContext<AppContextType>({
  disks: [],
  files: [],
  fileCounter: async () => {},
  fetchDisks: async () => {},
  downloads: [],
  fetchDownloads: async () => {},
  documents: [],
  fetchDocuments: async () => {},
  handleBack: () => {},
  handleHome: () => {},
  searchValue: "",
  handleSearch: () => {},
});

// Create the Provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [disks, setDisks] = useState<string[]>([]);
  const [downloads, setDownloads] = useState<FileInfo[]>([]);
  const [documents, setDocuments] = useState<FileInfo[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [files, setFiles] = useState<number[]>([0]);

  // Fetch disks from the backend
  const fetchDisks = async () => {
    try {
      const result = await invoke<string[]>("list_disks");
      setDisks(result || []);
    } catch (error) {
      console.error("Error fetching disks:", error);
    }
  };

  // Fetch downloads from the backend
  const fetchDownloads = async () => {
    try {
      const result = await invoke<FileInfo[]>("list_downloads");
      setDownloads(result || []);
      console.log("Downloads fetched:", result);
    } catch (error) {
      console.error("Error fetching downloads:", error);
    }
  };

  // Fetch documents from the backend
  const fetchDocuments = async () => {
    try {
      const result = await invoke<FileInfo[]>("list_documents");
      setDocuments(result || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  // Navigation logic
  const handleBack = () => {
    console.log("Navigate to the previous directory");
    // Add navigation logic here
  };

  const handleHome = () => {
    console.log("Navigate to the home directory");
    // Add navigation logic here
  };

  // Handle search input
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    console.log("Search Value:", event.target.value);
  };

  // File counter function
  const fileCounter = async () => {
    try {
      const updatedFiles = [1]; // Example logic to update files
      setFiles(updatedFiles);
      console.log("Files updated:", updatedFiles);
    } catch (error) {
      console.error("Error in fileCounter:", error);
    }
  };

  // Fetch initial data on mount
  useEffect(() => {
    fetchDisks();
    fetchDownloads();
    fetchDocuments();
  }, []);

  return (
    <AppContext.Provider
      value={{
        disks,
        fetchDisks,
        downloads,
        fetchDownloads,
        documents,
        fetchDocuments,
        handleBack,
        handleHome,
        searchValue,
        handleSearch,
        fileCounter,
        files,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
