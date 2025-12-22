import { useContext } from "react";
import { AppContext } from "../../context/Context";
import { Folder, File, Image, Calendar, HardDrive } from "lucide-react";
import { formatDate, getFileTypeLabel } from "../../utils/fileUtils";
import styles from "./Pictures.module.scss";

const Pictures = () => {
  const { pictures } = useContext(AppContext);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <Image size={24} className={styles.titleIcon} />
          Pictures
        </h2>
        {pictures?.length > 0 && (
          <span className={styles.count}>{pictures.length} items</span>
        )}
      </div>

      {pictures?.length ? (
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
              {pictures.map((picture, index) => (
                <tr
                  key={`${picture.file_name}-${index}`}
                  className={styles.row}
                >
                  <td className={styles.cellName}>
                    <div className={styles.nameContent}>
                      <span className={styles.fileIcon}>
                        {picture.file_type === "directory" ? (
                          <Folder size={20} className={styles.folderIcon} />
                        ) : (
                          <File size={20} className={styles.fileIconSvg} />
                        )}
                      </span>
                      <span
                        className={styles.fileName}
                        title={picture.file_name}
                      >
                        {picture.file_name}
                      </span>
                    </div>
                  </td>
                  <td className={styles.cellType}>
                    <span
                      className={`${styles.typeBadge} ${
                        styles[`type-${picture.file_type || "unknown"}`]
                      }`}
                      data-type={picture.file_type || "unknown"}
                    >
                      {getFileTypeLabel(picture.file_type || "unknown")}
                    </span>
                  </td>
                  <td className={styles.cellModified}>
                    <div className={styles.dateContent}>
                      <Calendar size={14} className={styles.dateIcon} />
                      <span>{formatDate(picture.modification_date)}</span>
                    </div>
                  </td>
                  <td className={styles.cellSize}>
                    <div className={styles.sizeContent}>
                      <HardDrive size={14} className={styles.sizeIcon} />
                      <span>{picture.formatted_size || "—"}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Image size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No pictures found</h3>
          <p className={styles.emptyText}>
            Your pictures folder is empty or could not be accessed.
          </p>
        </div>
      )}
    </div>
  );
};

export default Pictures;
