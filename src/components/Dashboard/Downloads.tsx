import { useContext } from "react";
import { AppContext } from "../../context/Context";
import { Folder, File, Download, Calendar, HardDrive } from "lucide-react";
import { formatDate, getFileTypeLabel } from "../../utils/fileUtils";
import styles from "./Downloads.module.scss";

const Downloads = () => {
  const { downloads } = useContext(AppContext);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <Download size={24} className={styles.titleIcon} />
          Downloads
        </h2>
        {downloads?.length > 0 && (
          <span className={styles.count}>{downloads.length} items</span>
        )}
      </div>

      {downloads?.length ? (
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
              {downloads.map((file, index) => (
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
                    <div className={styles.dateContent}>
                      <Calendar size={14} className={styles.dateIcon} />
                      <span>{formatDate(file.modification_date)}</span>
                    </div>
                  </td>
                  <td className={styles.cellSize}>
                    <div className={styles.sizeContent}>
                      <HardDrive size={14} className={styles.sizeIcon} />
                      <span>{file.formatted_size || "—"}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Download size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No downloads found</h3>
          <p className={styles.emptyText}>
            Your downloads folder is empty or could not be accessed.
          </p>
        </div>
      )}
    </div>
  );
};

export default Downloads;
