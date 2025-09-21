import { ViewMode } from "../../types/viewMode";
import ViewModeButton from "../ViewModeButton/ViewModeButton";
import styles from "./ViewModeButtonGroup.module.scss";

const ViewModeButtonGroup = () => {
  const viewModes = [
    { mode: 'normal' as ViewMode, label: "Normal" },
    { mode: 'minimal' as ViewMode, label: "Minimal" },
    { mode: 'grid' as ViewMode, label: "Grid" },
    { mode: 'list' as ViewMode, label: "List" },
  ];

  return (
    <div className={styles.buttonGroup}>
      {viewModes.map(({ mode, label }) => (
        <ViewModeButton
          key={mode}
          mode={mode}
          label={label}
        />
      ))}
    </div>
  );
};

export default ViewModeButtonGroup;
