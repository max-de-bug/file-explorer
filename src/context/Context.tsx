import { useNavigate } from "react-router-dom";
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
  currentDirectory: string;
  handleCurrentDirectory: (event: ChangeEvent<HTMLInputElement>) => void;
  setCurrentDirectory: React.Dispatch<React.SetStateAction<string>>; // Added this line
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
  currentDirectory: "",
  handleCurrentDirectory: () => {},
  setCurrentDirectory: () => {}, // Add a default empty function
});

// Create the Provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [disks, setDisks] = useState<string[]>([]);
  const [downloads, setDownloads] = useState<FileInfo[]>([]);
  const [documents, setDocuments] = useState<FileInfo[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [files, setFiles] = useState<number[]>([0]);
  const [currentDirectory, setCurrentDirectory] = useState<string>("/");
  const [previousDirectory, setPreviousDirectory] = useState<string>("");

  const navigate = useNavigate();

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
    if (currentDirectory === "/" || previousDirectory === "") {
      console.log(
        "Already at the root directory or no previous directory to navigate to."
      );
      return;
    }

    // Save the current directory as the new previous directory
    const newPreviousDirectory =
      currentDirectory.substring(0, currentDirectory.lastIndexOf("/")) || "/";

    setPreviousDirectory(newPreviousDirectory);
    setCurrentDirectory(previousDirectory);

    console.log("Navigating back to:", previousDirectory);
    console.log("Updated previousDirectory to:", newPreviousDirectory);

    // Optionally navigate using React Router
    navigate(previousDirectory);
  };

  const handleHome = () => {
    if (currentDirectory !== "/") {
      setPreviousDirectory(currentDirectory);
      setCurrentDirectory("/");
      navigate("/");
    }
    // Add navigation logic here
  };

  // Handle search input
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    console.log("Search Value:", event.target.value);
  };

  const handleCurrentDirectory = (event: ChangeEvent<HTMLInputElement>) => {
    const directory = event.target.value.trim();
    setCurrentDirectory(
      directory === "" ? "/" : directory.startsWith("/") ? directory : "/"
    );
    console.log("Current Directory:", directory);
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
        handleCurrentDirectory,
        currentDirectory,
        setCurrentDirectory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
