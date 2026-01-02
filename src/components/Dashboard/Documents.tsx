import { useContext } from "react";
import { AppContext } from "../../context/Context";
import { Folder, File, FileText, Calendar, HardDrive } from "lucide-react";
import { formatDate, getFileTypeLabel } from "../../utils/fileUtils";
import styles from "./Documents.module.scss";

const Documents = () => {
  const { documents } = useContext(AppContext);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <FileText size={20} className={styles.titleIcon} />
          Documents
        </h2>
        {documents?.length > 0 && (
          <span className={styles.count}>{documents.length} items</span>
        )}
      </div>

      {documents?.length ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.colName}>Name</th>
                <th className={styles.colType}>Type</th>
                <th className={styles.colModified}>Modified</th>
                <th className={styles.colSize}>Size</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((file, index) => (
                <tr key={`${file.file_name}-${index}`} className={styles.row}>
                  <td className={styles.cellName}>
                    <div className={styles.nameContent}>
                      <span className={styles.fileIcon}>
                        {file.file_type === "directory" ? (
                          <Folder size={20} className={styles.folderIcon} />
                        ) : (
                          <File size={20} className={styles.fileIconSvg} />
                        )}
                      </span>
                      <span className={styles.fileName} title={file.file_name}>
                        {file.file_name}
                      </span>
                    </div>
                  </td>
                  <td className={styles.cellType}>
                    <span
                      className={`${styles.typeBadge} ${
                        styles[`type-${file.file_type || "unknown"}`]
                      }`}
                      data-type={file.file_type || "unknown"}
                    >
                      {getFileTypeLabel(file.file_type || "unknown")}
                    </span>
                  </td>
                  <td className={styles.cellModified}>
                    <span>{formatDate(file.modification_date)}</span>
                  </td>
                  <td className={styles.cellSize}>
                    <span>{file.formatted_size || "—"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Folder size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No documents found</h3>
          <p className={styles.emptyText}>
            Your documents folder is empty or could not be accessed.
          </p>
        </div>
      )}
    </div>
  );
};

export default Documents;
