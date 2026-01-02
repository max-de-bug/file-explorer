import { useContext } from "react";
import { AppContext } from "../../context/Context";
import { HardDrive, Database, TrendingUp } from "lucide-react";
import { calculateUsagePercentage, getUsageColor } from "../../utils/fileUtils";
import styles from "../Dashboard/DisklList.module.scss";

const DiskList = () => {
  const { disks } = useContext(AppContext);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <HardDrive size={20} className={styles.titleIcon} />
          Disks
        </h2>
        {disks?.length > 0 && (
          <span className={styles.count}>{disks.length} drives</span>
        )}
      </div>

      {disks?.length ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.colName}>Name</th>
                <th className={styles.colType}>Type</th>
                <th className={styles.colTotal}>Total</th>
                <th className={styles.colUsed}>Used</th>
                <th className={styles.colAvailable}>Available</th>
                <th className={styles.colUsage}>Usage</th>
              </tr>
            </thead>
            <tbody>
              {disks.map((disk, index) => {
                const usagePercentage = calculateUsagePercentage(
                  disk.used_space,
                  disk.total_space
                );
                const usageColor = getUsageColor(usagePercentage);

                return (
                  <tr key={`${disk.name}-${index}`} className={styles.row}>
                    <td className={styles.cellName}>
                      <div className={styles.nameContent}>
                        <span className={styles.diskIcon}>
                          <HardDrive size={20} className={styles.iconSvg} />
                        </span>
                        <span className={styles.diskName} title={disk.name}>
                          {disk.name}
                        </span>
                      </div>
                    </td>
                    <td className={styles.cellType}>
                      <span className={styles.typeBadge}>{disk.kind}</span>
                    </td>
                    <td className={styles.cellTotal}>
                      <div className={styles.sizeContent}>
                        <Database size={14} className={styles.sizeIcon} />
                        <span>{disk.formatted_total}</span>
                      </div>
                    </td>
                    <td className={styles.cellUsed}>
                      <div className={styles.sizeContent}>
                        <TrendingUp size={14} className={styles.sizeIcon} />
                        <span>{disk.formatted_used}</span>
                      </div>
                    </td>
                    <td className={styles.cellAvailable}>
                      <div className={styles.sizeContent}>
                        <HardDrive size={14} className={styles.sizeIcon} />
                        <span>{disk.formatted_available}</span>
                      </div>
                    </td>
                    <td className={styles.cellUsage}>
                      <div className={styles.usageContent}>
                        <div className={styles.usageBar}>
                          <div
                            className={styles.usageFill}
                            style={{
                              width: `${usagePercentage}%`,
                              backgroundColor: usageColor,
                            }}
                          />
                        </div>
                        <span
                          className={styles.usagePercentage}
                          style={{ color: usageColor }}
                        >
                          {usagePercentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <HardDrive size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No disks found</h3>
          <p className={styles.emptyText}>
            No storage devices detected or could not be accessed.
          </p>
        </div>
      )}
    </div>
  );
};

export default DiskList;
