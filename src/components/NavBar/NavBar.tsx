import { useContext } from "react";
import styles from "./NavBar.module.scss";
import { AppContext } from "../../context/Context";

const Navbar = () => {

  const { isDisplayMode, handleDisplayToggle } = useContext(AppContext);
  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <h4>File Explorer</h4>
      </div>
      <button className={styles.button} onClick={handleDisplayToggle}>
          {isDisplayMode ? "Back" : "Display"}
        </button>
    </div>
  );
};

export default Navbar;
