import {
  Home,
  Download,
  File,
  Image,
  Video,
  Music,
  HardDrive,
} from "lucide-react";
import styles from "./Sidebar.module.scss";
import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../../context/Context";

const menuItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Download, label: "Downloads", path: "/Downloads" },
  { icon: File, label: "Documents", path: "/Documents" },
  { icon: Image, label: "Pictures", path: "/Pictures" },
  { icon: Video, label: "Videos", path: "/Videos" },
  { icon: Music, label: "Music", path: "/Music" },
  { icon: HardDrive, label: "Disks", path: "/disks" },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentDirectory } = useContext(AppContext); // Access context data

  return (
    <div className={styles.sidebarContainer}>
      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`${styles.menuItem} ${isActive ? styles.active : ""}`}
              onClick={() => {
                setCurrentDirectory(item.path);
                navigate(item.path);
              }}
            >
              <item.icon size={18} />
              <span className={styles.label}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
