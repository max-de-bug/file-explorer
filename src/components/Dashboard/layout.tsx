import { useContext } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AppContext } from "../../context/Context";
import DiskList from "./DiskList";
import Downloads from "./Downloads";
import Documents from "./Documents";
import Pictures from "./Pictures";
import ConditionalDashboardHeader from "./ConditionalDashboardHeader";
import styles from "./DashboardLayout.module.scss";

const DashboardLayout = () => {
  const { viewMode, disks, downloads, documents, pictures } = useContext(AppContext);
  const location = useLocation();

  const renderDashboardContent = () => {
    switch (viewMode) {
      case "minimal":
        return (
          <div className={styles.minimalView}>
            <Routes>
              <Route path="/" element={<DiskList />} />
              <Route path="/disks" element={<DiskList />} />
              <Route path="/Downloads" element={<Downloads />} />
              <Route path="/Documents" element={<Documents />} />
              <Route path="/Pictures" element={<Pictures />} />
            </Routes>
          </div>
        );
      case "grid":
        // Determine which dataset to render based on current route
        const gridPath = location.pathname;
        let gridItems: Array<any> = [];
        let gridTitle = "";

        if (gridPath === "/" || gridPath.toLowerCase() === "/disks") {
          gridItems = disks;
          gridTitle = "Disks";
        } else if (gridPath.toLowerCase() === "/downloads") {
          gridItems = downloads;
          gridTitle = "Downloads";
        } else if (gridPath.toLowerCase() === "/documents") {
          gridItems = documents;
          gridTitle = "Documents";
        } else if (gridPath.toLowerCase() === "/pictures") {
          gridItems = pictures;
          gridTitle = "Pictures";
        }

        return (
          <div className={styles.gridView}>
            {gridItems && gridItems.length > 0 ? (
              gridItems.map((item: any, idx: number) => {
                // Support disk cards and generic file cards
                const isDisk = item && typeof item === "object" && "name" in item && "formatted_total" in item;
                return (
                  <div key={idx} className={styles.gridContent}>
                    {isDisk ? (
                      <>
                        <h3>{item.name}</h3>
                        <p>Type: {item.kind}</p>
                        <p>Total: {item.formatted_total}</p>
                        <p>Used: {item.formatted_used}</p>
                        <p>Available: {item.formatted_available}</p>
                      </>
                    ) : (
                      <>
                        <h3>{item.file_name}</h3>
                        {item.modification_date && (
                          <p>Modified: {item.modification_date}</p>
                        )}
                        {item.formatted_size && (
                          <p>Size: {item.formatted_size}</p>
                        )}
                      </>
                    )}
                  </div>
                );
              })
            ) : (
              <div className={styles.gridContent}>
                <h3>{gridTitle || "No items"}</h3>
                <p>No content available.</p>
              </div>
            )}
          </div>
        );
      case "list":
        // Determine which dataset to render based on current route
        const listPath = location.pathname;
        let listItems: Array<any> = [];
        let listTitle = "";
        const LIST_THRESHOLD = 15; // Threshold for switching to two-column layout

        if (listPath === "/" || listPath.toLowerCase() === "/disks") {
          listItems = disks;
          listTitle = "Disks";
        } else if (listPath.toLowerCase() === "/downloads") {
          listItems = downloads;
          listTitle = "Downloads";
        } else if (listPath.toLowerCase() === "/documents") {
          listItems = documents;
          listTitle = "Documents";
        } else if (listPath.toLowerCase() === "/pictures") {
          listItems = pictures;
          listTitle = "Pictures";
        }

        const renderTableHeader = () => {
          // If first item looks like a disk, show disk columns; else show file columns
          const sample = listItems?.[0];
          const isDisk = sample && typeof sample === "object" && "name" in sample && "formatted_total" in sample;
          if (isDisk) {
            return (
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Type</th>
                <th scope="col">Total</th>
                <th scope="col">Used</th>
                <th scope="col">Available</th>
              </tr>
            );
          }
          return (
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Modified</th>
              <th scope="col">Size</th>
            </tr>
          );
        };

        const renderTableBody = () => {
          if (!listItems || listItems.length === 0) {
            return (
              <tr className={styles.emptyRow}>
                <td colSpan={5}>
                  <div className={styles.emptyState}>
                    <h4>{listTitle || "No items"}</h4>
                    <p>No content available.</p>
                  </div>
                </td>
              </tr>
            );
          }

          return listItems.map((item: any, idx: number) => {
            const isDisk = item && typeof item === "object" && "name" in item && "formatted_total" in item;
            if (isDisk) {
              return (
                <tr key={`disk-${idx}`} className={styles.row}>
                  <td>{item.name}</td>
                  <td>{item.kind}</td>
                  <td>{item.formatted_total}</td>
                  <td>{item.formatted_used}</td>
                  <td>{item.formatted_available}</td>
                </tr>
              );
            }

            return (
              <tr key={`file-${idx}`} className={styles.row}>
                <td>{item.file_name}</td>
                <td>{item.modification_date || "—"}</td>
                <td>{item.formatted_size || "—"}</td>
              </tr>
            );
          });
        };

        const renderTwoColumnLayout = () => {
          return (
            <div className={styles.twoColumnGrid} role="region" aria-label={`${listTitle} list`}>
              {listItems.map((item: any, idx: number) => {
                const isDisk = item && typeof item === "object" && "name" in item && "formatted_total" in item;
                return (
                  <div key={`item-${idx}`} className={styles.twoColumnCard}>
                    {isDisk ? (
                      <>
                        <h4>{item.name}</h4>
                        <p>Type: {item.kind}</p>
                        <p>Total: {item.formatted_total}</p>
                        <p>Used: {item.formatted_used}</p>
                        <p>Available: {item.formatted_available}</p>
                      </>
                    ) : (
                      <>
                        <h4>{item.file_name}</h4>
                        <p>Modified: {item.modification_date || "—"}</p>
                        <p>Size: {item.formatted_size || "—"}</p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          );
        };

        return (
          <div className={styles.listView}>
            <div className={styles.listContent}>
              <h3>{listTitle || "List"}</h3>
              {listItems.length > LIST_THRESHOLD ? (
                renderTwoColumnLayout()
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.listTable}>
                    <thead>{renderTableHeader()}</thead>
                    <tbody>{renderTableBody()}</tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      case "normal":
      default:
        return (
          <div className={styles.normalView}>
            <ConditionalDashboardHeader />
            <Routes>
              <Route path="/" element={<DiskList />} />
              <Route path="/disks" element={<DiskList />} />
              <Route path="/Downloads" element={<Downloads />} />
              <Route path="/Documents" element={<Documents />} />
              <Route path="/Pictures" element={<Pictures />} />
            </Routes>
          </div>
        );
    }
  };

  return (
    <div className={`${styles.dashboardLayout} ${styles[viewMode]}`}>
      {renderDashboardContent()}
    </div>
  );
};

export default DashboardLayout;
