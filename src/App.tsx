import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import styles from "./App.module.scss";
import DiskList from "./components/Dashboard/DiskList";
import Navbar from "./components/NavBar/NavBar";
import { Sidebar } from "./components/SideBar/SideBar";
import { AppProvider } from "./context/Context";
import Downloads from "./components/Dashboard/Downloads";
import Documents from "./components/Dashboard/Documents";
import Header from "./components/Dashboard/Header";
import Path from "./components/Path/Path";
import DashboardHeader from "./components/Dashboard/DashboardHeader";

// Component to conditionally render DashboardHeader
const ConditionalDashboardHeader = () => {
  const location = useLocation();
  const routesWithHeader = [
    "/Downloads",
    "/Documents",
    "/Pictures",
    "/Videos",
    "/Music",
  ];

  return routesWithHeader.includes(location.pathname) ? (
    <DashboardHeader />
  ) : null;
};

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Navbar />
        <Header />
        <div className={styles.flexContainer}>
          <Sidebar />
          <div className={styles.dashboard}>
            <ConditionalDashboardHeader />
            <Routes>
              <Route path="/" element={<DiskList />} />
              <Route path="/Downloads" element={<Downloads />} />
              <Route path="/Documents" element={<Documents />} />
            </Routes>
          </div>
        </div>
        <Path />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
