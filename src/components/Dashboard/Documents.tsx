import { useContext } from "react";
import { AppContext } from "../../context/Context";
import styles from "./Documents.module.scss"; // Assuming you have a SCSS file for styling

const Documents = () => {
  const { documents } = useContext(AppContext); // Access context data

  return (
    <>
      <div className={styles.container}>
        {documents?.length ? (
          <ul className={styles.list}>
            {documents.map((file, index) => (
              <li key={index} className={styles.listItem}>
                <span className={styles.fileName}>{file.file_name}</span>
                <span className={styles.fileDate}>
                  Modified: {file.modification_date}
                </span>
                <span className={styles.fileSize}>
                  Size: {file.formatted_size}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No documents available.</p>
        )}
      </div>
    </>
  );
};

export default Documents;
