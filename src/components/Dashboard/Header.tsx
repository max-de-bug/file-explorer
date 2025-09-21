import { useContext } from "react";
import styles from "./Header.module.scss";
import { AppContext } from "../../context/Context";

const Header = () => {
  const { handleBack, handleHome, handleSearch, searchValue } =
    useContext(AppContext);

  return (
    <div className={styles.container}>
      <div className={styles.buttonContainer}>
        <button className={styles.button} onClick={handleHome}>
          Home
        </button>
        <button className={styles.button} onClick={handleBack}>
          Back
        </button>
      </div>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search..."
          value={searchValue}
          onChange={handleSearch}
          className={styles.searchInput}
        />
      </div>
    </div>
  );
};

export default Header;
