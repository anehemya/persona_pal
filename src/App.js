import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateSurvey from './pages/CreateSurvey';
import SurveyView from './pages/SurveyView';
import StarredPage from './pages/StarredPage';
import RecentsPage from './pages/RecentsPage';
import SurveyQuestions from './pages/SurveyQuestions';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create-survey" element={<CreateSurvey />} />
        <Route path="/survey/:id" element={<SurveyView />} />
        <Route path="/starred" element={<StarredPage />} />
        <Route path="/recents" element={<RecentsPage />} />
        <Route path="/survey-questions" element={<SurveyQuestions />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App; 