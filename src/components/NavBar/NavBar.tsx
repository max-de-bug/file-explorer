import { useContext } from "react";
import styles from "./NavBar.module.scss";
import { AppContext } from "../../context/Context";
const Navbar = () => {
  const { currentDirectory, handleCurrentDirectory } = useContext(AppContext); // Access context data

  return (
    <div className={styles.container}>
      <h4>File explorer</h4>
      <input
        type="text"
        placeholder="Directory"
        value={currentDirectory}
        onChange={handleCurrentDirectory}
        className={styles.directoryInput}
      />
    </div>
  );
};

export default Navbar;
