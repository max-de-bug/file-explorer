import styles from "./NavBar.module.scss";
import ViewModeDropdown from "../ViewModeDropdown/ViewModeDropdown";

const Navbar = () => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <h4>File Explorer</h4>
      </div>
      <ViewModeDropdown />
    </div>
  );
};

export default Navbar;
