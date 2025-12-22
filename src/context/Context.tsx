import { useNavigate } from "react-router-dom";
import {
  createContext,
  useState,
  useEffect,
  useReducer,
  ReactNode,
  ChangeEvent,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { invoke } from "@tauri-apps/api/core";
import { debounce } from "lodash";
import { ViewMode } from "../types/viewMode";

// -------------------- Types --------------------

interface FileInfo {
  file_name: string;
  file_size: number;
  modification_date: string;
  formatted_size: string;
  file_type: string; // "file", "directory", "symlink", or "unknown"
  image?: string;
}

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
  currentDirectory: string;
  handleCurrentDirectory: (event: ChangeEvent<HTMLInputElement>) => void;
  setCurrentDirectory: (directory: string | ((prev: string) => string)) => void;
  viewMode: ViewMode;
  searchValue: string;
  setSearchValue: (value: string | ((prev: string) => string)) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  searchResults: FileInfo[];
  isSearching: boolean;
  setViewMode: (mode: ViewMode) => void;
}

// -------------------- Reducer --------------------

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

// -------------------- Context --------------------

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
  currentDirectory: "",
  handleCurrentDirectory: () => {},
  setCurrentDirectory: () => {},
  viewMode: "normal" as ViewMode,
  setViewMode: () => {},
  searchValue: "",
  setSearchValue: () => {},
  handleSearch: () => {},
  searchResults: [],
  isSearching: false,
});

// -------------------- Provider --------------------

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [previousDirectory, setPreviousDirectory] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("normal");
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchResults, setSearchResults] = useState<FileInfo[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const navigate = useNavigate();

  // -------------------- Helpers --------------------

  const invokeTauriCommand = useCallback(
    async (command: string): Promise<any> => {
      try {
        return await invoke(command);
      } catch (error) {
        console.error(`Error invoking ${command}:`, error);
        throw error;
      }
    },
    []
  );

  // -------------------- Search --------------------

  const performSearch = useCallback(async (query: string) => {
    if (query.trim() === "") {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results: FileInfo[] = await invoke("search_files", { query });
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching files:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const debouncedSearchRef = useRef(
    debounce((q: string) => performSearch(q), 300)
  );

  // ✅ Clean up debounce only when component unmounts
  useEffect(() => {
    return () => {
      debouncedSearchRef.current.cancel();
    };
  }, []);

  const handleSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    if (value.trim() === "") {
      setSearchResults([]);
      setIsSearching(false);
      debouncedSearchRef.current.cancel();
      return;
    }

    debouncedSearchRef.current(value);
  }, []);

  // -------------------- Directory Management --------------------

  const handleBack = useCallback(() => {
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
  }, [state.currentDirectory, previousDirectory, navigate]);

  const handleHome = useCallback(() => {
    if (state.currentDirectory !== "/") {
      setPreviousDirectory(state.currentDirectory);
      dispatch({ type: "SET_CURRENT_DIRECTORY", payload: "/" });
      navigate("/");
    }
  }, [state.currentDirectory, navigate]);

  const handleCurrentDirectory = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
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
    },
    []
  );

  // -------------------- Fetch Data --------------------

  const fetchDisks = useCallback(async () => {
    const result = (await invokeTauriCommand("list_disks")) as DiskInfo[];
    dispatch({ type: "SET_DISKS", payload: result });
  }, [invokeTauriCommand]);

  const fetchDownloads = useCallback(async () => {
    const result = (await invokeTauriCommand("list_downloads")) as FileInfo[];
    dispatch({ type: "SET_DOWNLOADS", payload: result });
  }, [invokeTauriCommand]);

  const fetchDocuments = useCallback(async () => {
    const result = (await invokeTauriCommand("list_documents")) as FileInfo[];
    dispatch({ type: "SET_DOCUMENTS", payload: result });
  }, [invokeTauriCommand]);

  const fetchPictures = useCallback(async () => {
    const result = (await invokeTauriCommand("list_pictures")) as FileInfo[];
    dispatch({ type: "SET_PICTURES", payload: result });
  }, [invokeTauriCommand]);

  // -------------------- Lifecycle --------------------

  useEffect(() => {
    (async () => {
      try {
        await invoke("build_index");
        console.log("File index built successfully");
      } catch (error) {
        console.error("Error building index:", error);
      }
    })();
  }, []);

  useEffect(() => {
    fetchDisks();
    fetchDownloads();
    fetchDocuments();
    fetchPictures();
  }, [fetchDisks, fetchDownloads, fetchDocuments, fetchPictures]);

  // -------------------- Context Value --------------------

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
      handleCurrentDirectory,
      setSearchValue,
      currentDirectory: state.currentDirectory,
      setCurrentDirectory: (directory: string | ((prev: string) => string)) =>
        dispatch({
          type: "SET_CURRENT_DIRECTORY",
          payload:
            typeof directory === "function"
              ? directory(state.currentDirectory)
              : directory,
        }),
      viewMode,
      setViewMode,
      searchValue,
      handleSearch,
      searchResults,
      isSearching,
    }),
    [
      state.disks,
      state.downloads,
      state.documents,
      state.currentDirectory,
      state.pictures,
      viewMode,
      searchValue,
      searchResults,
      isSearching,
      fetchDisks,
      fetchDownloads,
      fetchDocuments,
      fetchPictures,
      handleBack,
      handleHome,
      handleCurrentDirectory,
      handleSearch,
    ]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
