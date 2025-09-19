import { useNavigate } from "react-router-dom";
import {
  createContext,
  useState,
  useEffect,
  useReducer,
  ReactNode,
  ChangeEvent,
  useMemo,
} from "react";
import { invoke } from "@tauri-apps/api/core";

// FileInfo type definition
interface FileInfo {
  file_name: string;
  file_size: number;
  modification_date: string;
  formatted_size: string;
}

// DiskInfo type definition
interface DiskInfo {
  name: string;
  kind: string;
  total_space: number;
  available_space: number;
  used_space: number;
  formatted_total: string;
  formatted_available: string;
  formatted_used: string;
}

// AppContextType for type safety
interface AppContextType {
  disks: DiskInfo[];
  fetchDisks: () => Promise<void>;
  pictures: FileInfo[];
  fetchPictures: () => Promise<void>;
  downloads: FileInfo[];
  fetchDownloads: () => Promise<void>;
  documents: FileInfo[];
  fetchDocuments: () => Promise<void>;
  handleBack: () => void;
  handleHome: () => void;
  searchValue: string;
  handleSearch: (event: ChangeEvent<HTMLInputElement>) => void;
  currentDirectory: string;
  handleCurrentDirectory: (event: ChangeEvent<HTMLInputElement>) => void;
  setCurrentDirectory: (directory: string | ((prev: string) => string)) => void;
}

// Reducer for managing state
type State = {
  disks: DiskInfo[];
  downloads: FileInfo[];
  documents: FileInfo[];
  currentDirectory: string;
  pictures: FileInfo[];
};

type Action =
  | { type: "SET_DISKS"; payload: DiskInfo[] }
  | { type: "SET_DOWNLOADS"; payload: FileInfo[] }
  | { type: "SET_DOCUMENTS"; payload: FileInfo[] }
  | { type: "SET_CURRENT_DIRECTORY"; payload: string }
  | { type: "SET_PICTURES"; payload: FileInfo[] };

const initialState: State = {
  disks: [],
  downloads: [],
  documents: [],
  currentDirectory: "/",
  pictures: [],
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_DISKS":
      return { ...state, disks: action.payload };
    case "SET_DOWNLOADS":
      return { ...state, downloads: action.payload };
    case "SET_DOCUMENTS":
      return { ...state, documents: action.payload };
    case "SET_CURRENT_DIRECTORY":
      return { ...state, currentDirectory: action.payload };
    case "SET_PICTURES":
      return { ...state, pictures: action.payload };
    default:
      return state;
  }
};

// Context with default values
export const AppContext = createContext<AppContextType>({
  disks: [],
  fetchDisks: async () => {},
  downloads: [],
  fetchDownloads: async () => {},
  documents: [],
  fetchDocuments: async () => {},
  pictures: [],
  fetchPictures: async () => {},
  handleBack: () => {},
  handleHome: () => {},
  searchValue: "",
  handleSearch: () => {},
  currentDirectory: "",
  handleCurrentDirectory: () => {},
  setCurrentDirectory: () => {},
});

// Provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [searchValue, setSearchValue] = useState<string>("");
  const [previousDirectory, setPreviousDirectory] = useState<string>("");

  const navigate = useNavigate();

  // API utility function to invoke Tauri commands
  const invokeTauriCommand = async (command: string): Promise<any> => {
    try {
      return await invoke(command);
    } catch (error) {
      console.error(`Error invoking ${command}:`, error);
      throw error;
    }
  };

  // Fetch disks from backend
  const fetchDisks = async () => {
    const result = (await invokeTauriCommand("list_disks")) as DiskInfo[];
    dispatch({ type: "SET_DISKS", payload: result });
  };

  // Fetch downloads from backend
  const fetchDownloads = async () => {
    const result = (await invokeTauriCommand("list_downloads")) as FileInfo[];
    dispatch({ type: "SET_DOWNLOADS", payload: result });
  };

  // Fetch documents from backend
  const fetchDocuments = async () => {
    const result = (await invokeTauriCommand("list_documents")) as FileInfo[];
    dispatch({ type: "SET_DOCUMENTS", payload: result });
  };
  
  // Fetch pictures from backend
  const fetchPictures = async () => {
    const result = (await invokeTauriCommand("list_pictures")) as FileInfo[];
    dispatch({ type: "SET_PICTURES", payload: result });
  };

  // Handle back navigation
  const handleBack = () => {
    if (state.currentDirectory === "/" || previousDirectory === "") {
      console.log("Already at root directory or no previous directory.");
      return;
    }

    const newPreviousDirectory =
      state.currentDirectory.substring(
        0,
        state.currentDirectory.lastIndexOf("/")
      ) || "/";

    setPreviousDirectory(newPreviousDirectory);
    dispatch({ type: "SET_CURRENT_DIRECTORY", payload: newPreviousDirectory });
    navigate(newPreviousDirectory);
  };

  // Handle home navigation
  const handleHome = () => {
    if (state.currentDirectory !== "/") {
      setPreviousDirectory(state.currentDirectory);
      dispatch({ type: "SET_CURRENT_DIRECTORY", payload: "/" });
      navigate("/");
    }
  };

  // Handle search value change
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    console.log("Search Value:", event.target.value);
  };

  // Handle current directory change
  const handleCurrentDirectory = (event: ChangeEvent<HTMLInputElement>) => {
    const directory = event.target.value.trim();
    const newDirectory =
      directory === ""
        ? "/"
        : directory.startsWith("/")
        ? directory
        : `/${directory}`;
    dispatch({
      type: "SET_CURRENT_DIRECTORY",
      payload: newDirectory,
    });
    console.log("Current Directory:", newDirectory);
  };

  // Fetch initial data on mount
  useEffect(() => {
    fetchDisks();
    fetchDownloads();
    fetchDocuments();
    fetchPictures();
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      disks: state.disks,
      fetchDisks,
      pictures: state.pictures,
      fetchPictures,
      downloads: state.downloads,
      fetchDownloads,
      documents: state.documents,
      fetchDocuments,
      handleBack,
      handleHome,
      searchValue,
      handleSearch,
      handleCurrentDirectory,
      currentDirectory: state.currentDirectory,
      setCurrentDirectory: (directory: string | ((prev: string) => string)) =>
        dispatch({
          type: "SET_CURRENT_DIRECTORY",
          payload:
            typeof directory === "function"
              ? directory(state.currentDirectory)
              : directory,
        }),
    }),
    [
      state.disks,
      state.downloads,
      state.documents,
      state.currentDirectory,
      searchValue,
    ]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
