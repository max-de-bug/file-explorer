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

const menuItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Download, label: "Downloads", path: "/Downloads" },
  { icon: File, label: "Documents", path: "/Documents" },
  { icon: Image, label: "Pictures", path: "/Pictures" },
  { icon: Video, label: "Videos", path: "/Videos" },
  { icon: Music, label: "Music", path: "/Music" },
  { icon: HardDrive, label: "Disks", path: "/" },
];

interface SidebarProps {
  onNavigate: (path: string) => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <div className={styles.sidebarContainer}>
      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <button
            key={item.path}
            className={styles.menuItem}
            onClick={() => onNavigate(item.path)}
          >
            <item.icon size={18} />
            <span className={styles.label}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
