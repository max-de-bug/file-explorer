import { useContext } from "react";
import { AppContext } from "../../context/Context";
import { ViewMode } from "../../types/viewMode";
import styles from "./ViewModeButton.module.scss";

interface ViewModeButtonProps {
  mode: ViewMode;
  label: string;
  className?: string;
}

const ViewModeButton = ({ mode, label, className = "" }: ViewModeButtonProps) => {
  const { viewMode, setViewMode } = useContext(AppContext);
  const isActive = viewMode === mode;

  return (
    <button
      className={`${styles.button} ${isActive ? styles.active : ""} ${className}`}
      onClick={() => setViewMode(mode)}
    >
      {label}
    </button>
  );
};

export default ViewModeButton;
