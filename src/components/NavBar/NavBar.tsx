import { useContext } from "react";
import styles from "./NavBar.module.scss";
import { AppContext } from "../../context/Context";

const Navbar = () => {
  const { currentDirectory, handleCurrentDirectory } = useContext(AppContext);

  // Split the current directory into segments
  const directorySegments =
    currentDirectory === "/"
      ? ["/"]
      : ["/", ...currentDirectory.split("/").filter(Boolean)];

  const handleNavigateToSegment = (index: number) => {
    const newPath = directorySegments.slice(0, index + 1).join("/");
    // Ensure the path starts with '/' but avoid adding an extra one
    const pathToUpdate = newPath.startsWith("/") ? newPath : "/" + newPath;
    handleCurrentDirectory({ target: { value: pathToUpdate } }); // Update directory in context
  };

  return (
    <div className={styles.container}>
      <h4>File Explorer</h4>
      <div className={styles.breadcrumbs}>
        {directorySegments.map((segment, index) => (
          <button
            key={index}
            onClick={() => handleNavigateToSegment(index)}
            className={styles.breadcrumbButton}
          >
            {segment}
          </button>
        ))}
      </div>
      <input
        type="text"
        placeholder="Directory"
        value={currentDirectory}
        onChange={handleCurrentDirectory}
        className={styles.directoryInput}
      />
    </div>
  );
};

export default Navbar;
