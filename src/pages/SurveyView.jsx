import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { Box, Typography, Grid, Card, Button, Radio, RadioGroup, FormControlLabel, FormControl, Slider, TextField } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';

// Copy the colors from CreateSurvey
const COLORS = ['#FFD700', '#87CEEB', '#90EE90', '#DDA0DD'];

// Copy the StablePieChart component
const StablePieChart = ({ data }) => (
  <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
    <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius="80%"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  </Box>
);

// Add this component to display questions
const QuestionDisplay = ({ question, index }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        {index + 1}. {question.question}
      </Typography>

      {question.type === 'multiple-choice' && (
        <FormControl component="fieldset">
          <RadioGroup>
            {question.options.map((option, i) => (
              <FormControlLabel
                key={i}
                value={option}
                control={<Radio />}
                label={option}
              />
            ))}
          </RadioGroup>
        </FormControl>
      )}

      {question.type === 'slider' && (
        <Box sx={{ px: 2 }}>
          <Slider
            min={question.min}
            max={question.max}
            step={question.step}
            marks={[
              { value: question.min, label: question.min },
              { value: question.max, label: question.max }
            ]}
            valueLabelDisplay="auto"
          />
        </Box>
      )}

      {question.type === 'numeric' && (
        <TextField
          type="number"
          placeholder={question.placeholder}
          InputProps={{
            inputProps: { 
              min: question.min,
              max: question.max
            }
          }}
        />
      )}

      {question.type === 'true-false' && (
        <FormControl component="fieldset">
          <RadioGroup>
            {question.options.map((option, i) => (
              <FormControlLabel
                key={i}
                value={option}
                control={<Radio />}
                label={option}
              />
            ))}
          </RadioGroup>
        </FormControl>
      )}
    </Box>
  );
};

const SurveyView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(() => {
    // Try to get survey from location state first
    if (location.state?.survey) {
      return location.state.survey;
    }
    // If not in state, try to get from localStorage using URL id
    const pathId = window.location.pathname.split('/').pop();
    const surveys = JSON.parse(localStorage.getItem('surveys') || '[]');
    return surveys.find(s => s.id.toString() === pathId);
  });

  if (!survey) {
    return (
      <Layout>
        <Box sx={{ p: 3 }}>
          <Typography>Survey not found</Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Return to Home
          </Button>
        </Box>
      </Layout>
    );
  }

  const handleEdit = () => {
    navigate('/create-survey', { 
      state: { 
        editMode: true,
        surveyToEdit: survey
      }
    });
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        {/* Header with back button and edit button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
          >
            Back to Surveys
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Edit Survey
          </Button>
        </Box>

        <Typography variant="h5" gutterBottom>
          {survey.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Owner: {survey.owner}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Creation Date: {survey.creationDate}
        </Typography>

        {/* Display demographics */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Demographics</Typography>
          <Typography variant="subtitle1" gutterBottom>Customer</Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {survey.demographics.map((demographic) => (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                lg={3}
                key={demographic.id}
                sx={{ minWidth: '200px' }}
              >
                <Card 
                  sx={{ 
                    p: 2, 
                    height: '250px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    {demographic.label}
                  </Typography>
                  {demographic.ranges && demographic.ranges.length > 0 && (
                    <Box sx={{ flex: 1, minHeight: 0 }}>
                      <StablePieChart data={demographic.ranges} />
                    </Box>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Display custom information */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Custom Information</Typography>
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>
            {survey.customInformation}
          </Typography>
        </Box>

        {/* Add the questions section to the SurveyView component */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Survey Questions</Typography>
          {survey.questions?.map((question, index) => (
            <QuestionDisplay
              key={question.id}
              question={question}
              index={index}
            />
          ))}
        </Box>
      </Box>
    </Layout>
  );
};

export default SurveyView; 