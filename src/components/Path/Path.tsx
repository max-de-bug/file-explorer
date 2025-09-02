import { useContext } from "react";
import { AppContext } from "../../context/Context";
import styles from "./Path.module.scss";

const Path = () => {
  const { currentDirectory, handleCurrentDirectory } = useContext(AppContext);
  return (
    <input
      type="text"
      placeholder="Directory"
      value={currentDirectory}
      onChange={handleCurrentDirectory}
      className={styles.directoryInput}
    />
  );
};

export default Path;
