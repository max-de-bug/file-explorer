import { useContext } from "react";
import { AppContext } from "../../context/Context";
import styles from "../Dashboard/DisklList.module.scss";
const DiskList = () => {
  const { disks } = useContext(AppContext); // Access disks and fetchDisks from context

  return (
    <div className={styles.container}>
      {disks.length > 0 ? (
        <ul>
          {disks.map((disk, index) => (
            <li key={index}>
              <div>
                <strong>{disk.name}</strong> ({disk.kind})
              </div>
              <div>
                Total: {disk.formatted_total} | Used: {disk.formatted_used} |
                Available: {disk.formatted_available}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No disks found</p>
      )}
    </div>
  );
};

export default DiskList;
