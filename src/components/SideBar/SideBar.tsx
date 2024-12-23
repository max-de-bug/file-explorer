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
import { useNavigate } from "react-router-dom";

const menuItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Download, label: "Downloads", path: "/Dashboard/Downloads" }, // Updated path
  { icon: File, label: "Documents", path: "/Dashboard/Documents" },
  { icon: Image, label: "Pictures", path: "/Pictures" },
  { icon: Video, label: "Videos", path: "/Videos" },
  { icon: Music, label: "Music", path: "/Music" },
  { icon: HardDrive, label: "Disks", path: "/" },
];

export function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className={styles.sidebarContainer}>
      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <button
            key={item.path}
            className={styles.menuItem}
            onClick={() => navigate(item.path)} // Use navigate directly
          >
            <item.icon size={18} />
            <span className={styles.label}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
