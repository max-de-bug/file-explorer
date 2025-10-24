import { useContext } from "react";
import { AppContext } from "../../context/Context";
import styles from "./SearchBar.module.scss";

const Searchbar = () => {
  const { searchValue, handleSearch, searchResults } = useContext(AppContext);

  return (
    <div className={styles.searchContainer}>
      <input
        type="search"
        placeholder="Search files..."
        value={searchValue}
        onChange={handleSearch}
        className={styles.searchInput}
        aria-label="Search files"
      />

      {searchValue && <div className={styles.searchStatus}>Searching...</div>}

      {searchResults.length > 0 && (
        <div className={styles.resultsList}>
          {searchResults.map((result, index) => (
            <div key={index} className={styles.resultItem}>
              {result.file_name}
            </div>
          ))}
        </div>
      )}

      {searchValue && searchResults.length === 0 && (
        <div className={styles.noResults}>No results found</div>
      )}
    </div>
  );
};

export default Searchbar;
