import React from 'react';
import Layout from '../components/Layout/Layout';
import SurveyList from '../components/SurveyList/SurveyList';

const StarredPage = () => {
  return (
    <Layout>
      <SurveyList filterType="starred" />
    </Layout>
  );
};

export default StarredPage; 