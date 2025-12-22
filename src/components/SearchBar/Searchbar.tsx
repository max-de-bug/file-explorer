import { useContext } from "react";
import { AppContext } from "../../context/Context";
import { Search, File, Folder } from "lucide-react";
import { getFileTypeLabel } from "../../utils/fileUtils";
import styles from "./SearchBar.module.scss";

const Searchbar = () => {
  const { searchValue, handleSearch, searchResults, isSearching } = useContext(AppContext);

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchInputWrapper}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="search"
          placeholder="Search files..."
          value={searchValue}
          onChange={handleSearch}
          className={styles.searchInput}
          aria-label="Search files"
        />
      </div>

      {isSearching && searchValue && (
        <div className={styles.searchStatus}>Searching...</div>
      )}

      {searchResults.length > 0 && (
        <div className={styles.resultsList}>
          {searchResults.map((result, index) => (
            <div key={index} className={styles.resultItem}>
              <div className={styles.resultIcon}>
                {result.file_type === "directory" ? (
                  <Folder size={16} className={styles.folderIcon} />
                ) : (
                  <File size={16} className={styles.fileIcon} />
                )}
              </div>
              <span className={styles.resultFileName}>{result.file_name}</span>
              <span
                className={styles.fileType}
                data-type={result.file_type || "unknown"}
              >
                {getFileTypeLabel(result.file_type || "unknown")}
              </span>
            </div>
          ))}
        </div>
      )}

      {searchValue && !isSearching && searchResults.length === 0 && (
        <div className={styles.noResults}>No results found</div>
      )}
    </div>
  );
};

export default Searchbar;
