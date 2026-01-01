import {
  useContext,
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { AppContext } from "../../context/Context";
import {
  Search,
  File,
  Folder,
  X,
  Loader2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { getFileTypeLabel, formatDate } from "../../utils/fileUtils";
import {
  highlightMatch,
  truncatePath,
  formatSearchResults,
  sortSearchResults,
} from "../../utils/searchUtils";
import styles from "./SearchBar.module.scss";

const MAX_VISIBLE_RESULTS = 10;

const Searchbar = () => {
  const {
    searchValue,
    handleSearch,
    clearSearch,
    searchResults,
    isSearching,
    searchError,
  } = useContext(AppContext);

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showAllResults, setShowAllResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Format and sort results
  const formattedResults = useMemo(() => {
    if (!searchValue.trim()) return [];
    if (searchResults.length === 0) return [];
    const sorted = sortSearchResults(searchResults, searchValue);
    return formatSearchResults(sorted, searchValue);
  }, [searchResults, searchValue]);

  // Limit visible results
  const visibleResults = useMemo(() => {
    return showAllResults
      ? formattedResults
      : formattedResults.slice(0, MAX_VISIBLE_RESULTS);
  }, [formattedResults, showAllResults]);

  const hasMoreResults = formattedResults.length > MAX_VISIBLE_RESULTS;

  // Determine if results should be shown (prevents flickering)
  const shouldShowResults = useMemo(() => {
    return (
      searchValue.trim() !== "" &&
      !isSearching &&
      !searchError &&
      formattedResults.length > 0
    );
  }, [searchValue, isSearching, searchError, formattedResults.length]);

  const shouldShowNoResults = useMemo(() => {
    return (
      searchValue.trim() !== "" &&
      !isSearching &&
      !searchError &&
      formattedResults.length === 0
    );
  }, [searchValue, isSearching, searchError, formattedResults.length]);

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSelectedIndex(-1);
      }
    };

    if (shouldShowResults || shouldShowNoResults) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [shouldShowResults, shouldShowNoResults]);

  // Handle result click
  const handleResultClick = useCallback(
    (result: (typeof formattedResults)[0]) => {
      // TODO: Navigate to file or open file location
      console.log("Open file:", result.file_path);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    },
    []
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (visibleResults.length > 0) {
            setSelectedIndex((prev) =>
              prev < visibleResults.length - 1 ? prev + 1 : prev
            );
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && visibleResults[selectedIndex]) {
            handleResultClick(visibleResults[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          clearSearch();
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
        default:
          break;
      }
    },
    [visibleResults, selectedIndex, clearSearch, handleResultClick]
  );

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleSearch(e);
      setSelectedIndex(-1);
      setShowAllResults(false);
    },
    [handleSearch]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div ref={searchRef} className={styles.searchContainer}>
      <div className={styles.searchInputWrapper}>
        <Search size={18} className={styles.searchIcon} aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          placeholder="Search files..."
          value={searchValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={styles.searchInput}
          aria-label="Search files"
          aria-expanded={shouldShowResults}
          aria-controls="search-results"
          aria-autocomplete="list"
          role="combobox"
        />
        {searchValue && (
          <button
            type="button"
            onClick={clearSearch}
            className={styles.clearButton}
            aria-label="Clear search"
            tabIndex={0}
          >
            {isSearching ? (
              <Loader2 size={16} className={styles.loader} />
            ) : (
              <X size={16} />
            )}
          </button>
        )}
      </div>

      {/* Search Status */}
      {isSearching && searchValue && (
        <div className={styles.searchStatus} role="status" aria-live="polite">
          <Loader2 size={14} className={styles.statusLoader} />
          <span>Searching...</span>
        </div>
      )}

      {/* Error Message */}
      {searchError && !isSearching && (
        <div className={styles.searchError} role="alert">
          <AlertCircle size={14} />
          <span>{searchError}</span>
        </div>
      )}

      {/* Search Results */}
      {shouldShowResults && (
          <div
            id="search-results"
            ref={resultsRef}
            className={styles.searchResults}
            role="listbox"
            aria-label="Search results"
          >
            <div className={styles.resultsHeader}>
              <span>
                {formattedResults.length} result
                {formattedResults.length !== 1 ? "s" : ""} found
              </span>
            </div>
            <div className={styles.resultsList}>
              {visibleResults.map((result, index) => (
                <div
                  key={`${result.file_path}-${index}`}
                  className={`${styles.resultItem} ${
                    index === selectedIndex ? styles.resultItemSelected : ""
                  }`}
                  onClick={() => handleResultClick(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  role="option"
                  aria-selected={index === selectedIndex}
                  tabIndex={0}
                >
                  <div className={styles.resultIcon}>
                    {result.file_type === "directory" ? (
                      <Folder
                        size={16}
                        className={styles.folderIcon}
                        aria-hidden="true"
                      />
                    ) : (
                      <File
                        size={16}
                        className={styles.fileIcon}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className={styles.resultContent}>
                    <div className={styles.resultFileName}>
                      {result.highlightedName.map((part, i) => (
                        <span
                          key={i}
                          className={
                            part.isMatch ? styles.highlightedText : ""
                          }
                        >
                          {part.text}
                        </span>
                      ))}
                    </div>
                    <div className={styles.resultPath}>
                      {truncatePath(result.directoryPath)}
                    </div>
                    <div className={styles.resultMeta}>
                      <span className={styles.resultSize}>
                        {result.formatted_size}
                      </span>
                      <span className={styles.resultDate}>
                        {formatDate(result.modification_date)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={styles.fileType}
                    data-type={result.file_type || "unknown"}
                  >
                    {getFileTypeLabel(result.file_type || "unknown")}
                  </span>
                  <ChevronRight
                    size={16}
                    className={styles.chevronIcon}
                    aria-hidden="true"
                  />
                </div>
              ))}
              {hasMoreResults && !showAllResults && (
                <button
                  className={styles.showMoreButton}
                  onClick={() => setShowAllResults(true)}
                  aria-label={`Show ${formattedResults.length - MAX_VISIBLE_RESULTS} more results`}
                >
                  Show {formattedResults.length - MAX_VISIBLE_RESULTS} more
                  results
                </button>
              )}
            </div>
          </div>
        )}

      {/* No Results */}
      {shouldShowNoResults && (
          <div className={styles.noResults} role="status">
            <Search size={24} className={styles.noResultsIcon} />
            <div className={styles.noResultsTitle}>No results found</div>
            <div className={styles.noResultsText}>
              Try a different search term
            </div>
          </div>
        )}
    </div>
  );
};

export default Searchbar;
