import styles from "./NavBar.module.scss";

const Navbar = () => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <h4>RustyFiles</h4>
      </div>
    </div>
  );
};

export default Navbar;
