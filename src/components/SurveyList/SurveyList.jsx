import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SurveyList.module.css';

const SurveyList = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('list');
  const [showModal, setShowModal] = useState(false);
  const [surveyName, setSurveyName] = useState('');

  const handleCreateClick = () => {
    setShowModal(true);
  };

  const handleContinue = () => {
    if (surveyName.trim()) {
      navigate('/create-survey', { state: { surveyName } });
      setShowModal(false);
      setSurveyName('');
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setSurveyName('');
  };

  const mockSurveys = [
    {
      id: 1,
      title: 'Survey 1',
      createdDate: 'Dec 11, 2024',
      owner: 'Akiva Yeshurun',
      isStarred: false
    },
    // Add more mock surveys as needed
  ];

  return (
    <div className={styles.surveyListContainer}>
      <div className={styles.header}>
        <h1>Surveys in this team</h1>
        <button 
          className={styles.createButton}
          onClick={handleCreateClick}
        >
          + Create new
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Name Survey</h2>
            <input
              type="text"
              placeholder="e.g. Survey x"
              value={surveyName}
              onChange={(e) => setSurveyName(e.target.value)}
              className={styles.modalInput}
            />
            <div className={styles.modalButtons}>
              <button 
                className={styles.cancelButton}
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button 
                className={styles.continueButton}
                onClick={handleContinue}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.sortControl}>
          <span>Sort by</span>
          <select defaultValue="last-opened">
            <option value="last-opened">Last opened</option>
            <option value="name">Name</option>
            <option value="date">Date created</option>
          </select>
        </div>
        
        <div className={styles.viewControls}>
          <button
            className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
            onClick={() => setViewMode('grid')}
          >
            🖼Grid
          </button>
          <button
            className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => setViewMode('list')}
          >
            📝List
          </button>
        </div>
      </div>

      <div className={styles.surveyGrid}>
        {mockSurveys.map(survey => (
          <div key={survey.id} className={styles.surveyItem}>
            <div className={styles.surveyInfo}>
              <h3>{survey.title}</h3>
              <p>Created {survey.createdDate}</p>
              <p>{survey.owner}</p>
            </div>
            <div className={styles.surveyActions}>
              <button className={styles.starButton}>
                {survey.isStarred ? '⭐' : '☆'}
              </button>
              <button className={styles.moreButton}>...</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SurveyList; 