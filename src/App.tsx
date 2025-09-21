import { BrowserRouter } from "react-router-dom";
import "./App.css";
import styles from "./App.module.scss";
import Navbar from "./components/NavBar/NavBar";
import { Sidebar } from "./components/SideBar/SideBar";
import { AppProvider } from "./context/Context";
import Header from "./components/Dashboard/Header";
import Path from "./components/Path/Path";
import DashboardLayout from "./components/Dashboard/layout";

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Navbar />
        <Header />
        <div className={styles.flexContainer}>
          <Sidebar />
          <div className={styles.dashboard}>
            <DashboardLayout />
          </div>
        </div>
        <Path />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
