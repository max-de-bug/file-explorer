import styles from "./SearchBar.module.scss";
import { useContext } from "react";
import { AppContext } from "../../context/Context";

const Searchbar = () => {
  const { handleSearch, searchValue } = useContext(AppContext);
  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        placeholder="Search..."
        value={searchValue}
        onChange={handleSearch}
        className={styles.searchInput}
      />
    </div>
  );
};

export default Searchbar;
