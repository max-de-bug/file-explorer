import { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { AppContext } from "../../context/Context";
import DiskList from "./DiskList";
import Downloads from "./Downloads";
import Documents from "./Documents";
import Pictures from "./Pictures";
import ConditionalDashboardHeader from "./ConditionalDashboardHeader";
import styles from "./DashboardLayout.module.scss";

const DashboardLayout = () => {
  const { viewMode } = useContext(AppContext);

  const renderDashboardContent = () => {
    switch (viewMode) {
      case 'minimal':
        return (
          <div className={styles.minimalView}>
            <div className={styles.minimalContent}>
              <h3>Minimal View</h3>
              <p>This is a clean, minimal dashboard view</p>
            </div>
          </div>
        );
      case 'grid':
        return (
          <div className={styles.gridView}>
            <div className={styles.gridContent}>
              <h3>Grid View</h3>
              <p>This is a grid-based dashboard view</p>
            </div>
          </div>
        );
      case 'list':
        return (
          <div className={styles.listView}>
            <div className={styles.listContent}>
              <h3>List View</h3>
              <p>This is a list-based dashboard view</p>
            </div>
          </div>
        );
      case 'normal':
      default:
        return (
          <div className={styles.normalView}>
            <ConditionalDashboardHeader />
            <Routes>
              <Route path="/" element={<DiskList />} />
              <Route path="/disks" element={<DiskList />} />
              <Route path="/Downloads" element={<Downloads />} />
              <Route path="/Documents" element={<Documents />} />
              <Route path="/Pictures" element={<Pictures />} />
            </Routes>
          </div>
        );
    }
  };

  return (
    <div className={`${styles.dashboardLayout} ${styles[viewMode]}`}>
      {renderDashboardContent()}
    </div>
  );
};

export default DashboardLayout;
