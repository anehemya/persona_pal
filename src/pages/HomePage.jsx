import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import SurveyList from '../components/SurveyList/SurveyList';
import styles from './HomePage.module.css';

const HomePage = () => {
  return (
    <div className={styles.homeContainer}>
      <Sidebar />
      <main className={styles.mainContent}>
        <SurveyList />
      </main>
    </div>
  );
};

export default HomePage; 