import React from 'react';
import { useLocation } from 'react-router-dom';

const CreateSurvey = () => {
  const location = useLocation();
  const surveyName = location.state?.surveyName || 'Untitled Survey';

  return (
    <div>
      <h1>{surveyName}</h1>
      <p>Survey creation page - Under construction</p>
    </div>
  );
};

export default CreateSurvey; 