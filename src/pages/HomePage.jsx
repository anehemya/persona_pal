import React, { useState, useEffect } from 'react';
import SurveyList from '../components/SurveyList/SurveyList';
import Layout from '../components/Layout/Layout';

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Give components time to properly initialize
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <SurveyList />
      )}
    </Layout>
  );
};

export default HomePage; 