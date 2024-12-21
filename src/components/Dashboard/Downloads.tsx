import { useContext } from "react";
import { AppContext } from "../../context/Context";
import styles from "./Downloads.module.scss";

type File = {
  name: string;
  date: string;
  size: string;
};

const Downloads = () => {
  const { downloads } = useContext(AppContext); // Explicitly typed context

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Downloads</h1>
      <ul className={styles.list}>
        {downloads?.map((file: File, index: number) => (
          <li key={index} className={styles.listItem}>
            <span className={styles.fileName}>{file.name}</span>
            <span className={styles.fileDate}>Uploaded: {file.date}</span>
            <span className={styles.fileSize}>Size: {file.size}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Downloads;
