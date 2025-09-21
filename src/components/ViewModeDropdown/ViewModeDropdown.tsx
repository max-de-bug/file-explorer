import { useContext } from "react";
import { AppContext } from "../../context/Context";
import { ViewMode } from "../../types/viewMode";
import styles from "./ViewModeDropdown.module.scss";

const ViewModeDropdown = () => {
  const { viewMode, setViewMode } = useContext(AppContext);

  const viewModes: { value: ViewMode; label: string }[] = [
    { value: 'normal', label: 'Normal' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'grid', label: 'Grid' },
    { value: 'list', label: 'List' },
  ];

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setViewMode(event.target.value as ViewMode);
  };

  return (
    <select
      className={styles.dropdown}
      value={viewMode}
      onChange={handleChange}
    >
      {viewModes.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
};

export default ViewModeDropdown;
