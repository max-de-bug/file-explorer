import { useContext } from "react";
import { AppContext } from "../../context/Context";
import styles from "./Downloads.module.scss";
const Downloads = () => {
  const { downloads } = useContext(AppContext); // Access downloads from context

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Downloads</h1>
      <ul className={styles.list}>
        {downloads?.map((file, index) => (
          <li key={index} className={styles.listItem}>
            <span className={styles.fileName}>{file}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Downloads;
