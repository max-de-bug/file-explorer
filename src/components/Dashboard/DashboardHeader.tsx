import styles from "./DashboardHeader.module.scss";

const DashboardHeader = () => {
  return (
    <div className={styles.dashboardHeader}>
      <p>fileName</p>
      <p>fileDate</p>
      <p>fileSize</p>
    </div>
  );
};

export default DashboardHeader;
