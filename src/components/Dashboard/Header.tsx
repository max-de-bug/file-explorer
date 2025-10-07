import { useContext } from "react";
import styles from "./Header.module.scss";
import { AppContext } from "../../context/Context";
import { Home, ArrowLeft } from "lucide-react";

const Header = () => {
  const { handleBack, handleHome, handleSearch, searchValue } =
    useContext(AppContext);

  return (
    <div className={styles.container}>
      <div className={styles.buttonContainer}>
        <button
          className={styles.button}
          onClick={handleHome}
          aria-label="Home"
        >
          <Home size={18} />
        </button>
        <button
          className={styles.button}
          onClick={handleBack}
          aria-label="Back"
        >
          <ArrowLeft size={18} />
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
