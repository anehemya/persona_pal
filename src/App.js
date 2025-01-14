import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateSurvey from './pages/CreateSurvey';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create-survey" element={<CreateSurvey />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App; 