import { useContext } from "react";
import { AppContext } from "../../context/Context";
const Dowloads = () => {
  const { dowloads } = useContext(AppContext); // Access disks and fetchDisks from context
  console.log(dowloads);
  // // Optionally, you could call fetchDisks here if you want to allow re-fetching
  // useEffect(() => {
  //   if (disks.length === 0) {
  //     fetchDisks(); // Fetch disks if not already available
  //   }
  // }, [disks, fetchDisks]);

  return (
    <div>
      <h1>{dowloads}</h1>
    </div>
  );
};

export default Dowloads;
