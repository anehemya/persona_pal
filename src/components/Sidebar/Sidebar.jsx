import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by title or by topic"
          className={styles.searchInput}
        />
      </div>
      
      <nav className={styles.navigation}>
        <Link to="/" className={styles.navItem}>
          <span className={styles.icon}>🏠</span>
          Home
        </Link>
        <Link to="/recents" className={styles.navItem}>
          <span className={styles.icon}>🕒</span>
          Recents
        </Link>
        <Link to="/starred" className={styles.navItem}>
          <span className={styles.icon}>⭐</span>
          Starred
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar; 