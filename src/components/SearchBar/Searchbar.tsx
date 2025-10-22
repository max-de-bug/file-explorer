import { useContext } from "react";
import { AppContext } from "../../context/Context";
import styles from "./SearchBar.module.scss";

const Searchbar = () => {
  const { searchValue, handleSearch, searchResults, isSearching } =
    useContext(AppContext);

  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        placeholder="Search files..."
        value={searchValue}
        onChange={handleSearch}
        className={styles.searchInput}
        aria-label="Search files"
        disabled={isSearching}
      />

      {isSearching && <div className={styles.searchStatus}>Searching...</div>}

      {searchResults.length > 0 && !isSearching && (
        <div className={styles.resultsCount}>
          Found {searchResults.length} result
          {searchResults.length !== 1 ? "s" : ""}
        </div>
      )}

      {searchValue && searchResults.length === 0 && !isSearching && (
        <div className={styles.noResults}>No results found</div>
      )}
    </div>
  );
};

export default Searchbar;
