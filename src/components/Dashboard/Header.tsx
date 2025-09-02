import { useContext } from "react";
import styles from "./Header.module.scss";
import { AppContext } from "../../context/Context";

const Header = () => {
  const { handleBack, handleHome, handleSearch, searchValue } =
    useContext(AppContext);

  return (
    <div className={styles.container}>
      <button className={styles.button} onClick={handleHome}>
        Home
      </button>
      <button className={styles.button} onClick={handleBack}>
        Back
      </button>
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

export default Header;
