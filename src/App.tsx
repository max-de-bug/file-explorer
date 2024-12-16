import "./App.css";
import styles from "./App.module.scss";
import DiskList from "./components/DiskList/DiskList";
import Navbar from "./components/NavBar/NavBar";
import { Sidebar } from "./components/SideBar/SideBar";
import { AppProvider } from "./context/Context";

function App() {
  return (
    <>
      <AppProvider>
        <Navbar />
        <div className={styles.flexContainer}>
          <Sidebar onNavigate={() => {}} />
          <div className={styles.dashboard}>
            <DiskList />
          </div>
        </div>
      </AppProvider>
    </>
  );
}

export default App;
