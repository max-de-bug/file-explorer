import { useContext, useEffect } from "react";
import { AppContext } from "../../context/Context";
const DiskList = () => {
  const { disks, fetchDisks } = useContext(AppContext); // Access disks and fetchDisks from context

  // Optionally, you could call fetchDisks here if you want to allow re-fetching
  useEffect(() => {
    if (disks.length === 0) {
      fetchDisks(); // Fetch disks if not already available
    }
  }, [disks, fetchDisks]);

  return (
    <div>
      <h2>Disks</h2>
      {disks.length > 0 ? (
        <ul>
          {disks.map((disk, index) => (
            <li key={index}>{disk}</li>
          ))}
        </ul>
      ) : (
        <p>No disks found</p>
      )}
    </div>
  );
};

export default DiskList;
