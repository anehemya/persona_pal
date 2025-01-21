import React from 'react';
import Layout from '../components/Layout/Layout';
import SurveyList from '../components/SurveyList/SurveyList';

const RecentsPage = () => {
  return (
    <Layout>
      <SurveyList filterType="recent" />
    </Layout>
  );
};

export default RecentsPage; 