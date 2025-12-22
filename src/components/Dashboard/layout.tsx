import { Routes, Route } from "react-router-dom";
import DiskList from "./DiskList";
import Downloads from "./Downloads";
import Documents from "./Documents";
import Pictures from "./Pictures";
import styles from "./DashboardLayout.module.scss";

const DashboardLayout = () => {
  return (
    <div className={styles.dashboardLayout}>
      <div className={styles.normalView}>
        <Routes>
          <Route path="/" element={<DiskList />} />
          <Route path="/disks" element={<DiskList />} />
          <Route path="/Downloads" element={<Downloads />} />
          <Route path="/Documents" element={<Documents />} />
          <Route path="/Pictures" element={<Pictures />} />
        </Routes>
      </div>
    </div>
  );
};

export default DashboardLayout;
