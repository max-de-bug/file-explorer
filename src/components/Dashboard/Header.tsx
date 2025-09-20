import { useContext } from "react";
import styles from "./Header.module.scss";
import { AppContext } from "../../context/Context";

const Header = () => {
  const { handleBack, handleHome, handleSearch, searchValue, isDisplayMode, handleDisplayToggle } =
    useContext(AppContext);

  return (
    <div className={`${styles.container} ${isDisplayMode ? styles.minimal : ''}`}>
      {!isDisplayMode && (
        <div className={styles.buttonContainer}>
          <button className={styles.button} onClick={handleHome}>
            Home
          </button>
          <button className={styles.button} onClick={handleBack}>
            Back
          </button>
        </div>
      )}
      <div className={styles.searchContainer}>
       
        {!isDisplayMode && (
          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={handleSearch}
            className={styles.searchInput}
          />
        )}
      </div>
    </div>
  );
};

export default Header;
