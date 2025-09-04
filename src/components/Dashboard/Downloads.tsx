import { useContext } from "react";
import { AppContext } from "../../context/Context";
import styles from "./Downloads.module.scss";

const Downloads = () => {
  const { downloads } = useContext(AppContext); // Access context data

  return (
    <div className={styles.container}>
      {downloads.length > 0 ? (
        <ul className={styles.list}>
          {downloads.map((file, index: number) => (
            <li key={file.file_name || index} className={styles.listItem}>
              <span className={styles.fileName}>{file.file_name}</span>
              <span className={styles.fileDate}>
                Uploaded: {file.modification_date}
              </span>
              <span className={styles.fileSize}>
                Size: {file.formatted_size}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No downloads available.</p>
      )}
    </div>
  );
};

export default Downloads;
