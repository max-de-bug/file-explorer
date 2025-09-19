import { useContext } from "react";
import { AppContext } from "../../context/Context";
import styles from "./Pictures.module.scss";
const Pictures = () => {
    const { pictures } = useContext(AppContext);
    return ( 
        <div className={styles.container}>
            <h1>Pictures</h1>
            {pictures.length > 0 ? (
                <ul>
                    {pictures.map((picture) => (
                        <li key={picture.file_name}>{picture.file_name}</li>
                    ))}
                </ul>
            ) : (
                <p>No pictures found</p>
            )}
        </div>
     );
}
 
export default Pictures;