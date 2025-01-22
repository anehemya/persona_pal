import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Slider,
  IconButton
} from '@mui/material';
import Layout from '../components/Layout/Layout';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const QUESTION_TYPES = [
  {
    id: 'multiple-choice',
    label: 'Multiple Choice',
    icon: '☐',
    defaultConfig: {
      question: '',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4']
    }
  },
  {
    id: 'slider',
    label: 'Scale (1-10)',
    icon: '⟺',
    defaultConfig: {
      question: '',
      min: 1,
      max: 10,
      step: 1
    }
  },
  {
    id: 'numeric',
    label: 'Numeric Input',
    icon: '123',
    defaultConfig: {
      question: '',
      min: 0,
      max: null,
      placeholder: 'Enter a number'
    }
  },
  {
    id: 'true-false',
    label: 'True/False',
    icon: '✓/✗',
    defaultConfig: {
      question: '',
      options: ['True', 'False']
    }
  }
];

const QuestionDisplay = ({ question, index, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      sx={{ mb: 2, p: 3 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box {...attributes} {...listeners} sx={{ cursor: 'grab' }}>
          <DragIndicatorIcon sx={{ color: 'text.secondary', mt: 1 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              {index + 1}. {question.question}
            </Typography>
            <Box>
              <IconButton onClick={() => onEdit(question)}>
                <EditIcon />
              </IconButton>
              <IconButton 
                onClick={() => onDelete(question.id)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Preview based on question type */}
          {question.type === 'multiple-choice' && (
            <FormControl component="fieldset">
              <RadioGroup>
                {question.options.map((option, i) => (
                  <FormControlLabel
                    key={i}
                    value={option}
                    control={<Radio disabled />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}

          {question.type === 'slider' && (
            <Box sx={{ px: 2 }}>
              <Slider
                disabled
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
              disabled
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
                    control={<Radio disabled />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}
        </Box>
      </Box>
    </Card>
  );
};

const SurveyQuestions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const surveyData = location.state?.surveyData;
  const [questions, setQuestions] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState(null);
  const [questionConfig, setQuestionConfig] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!surveyData) {
    navigate('/');
    return null;
  }

  const handleTemplateSelect = (template) => {
    setSelectedQuestionType(template);
    setQuestionConfig({ ...template.defaultConfig });
  };

  const handleSaveSurvey = () => {
    const completeSurvey = {
      ...surveyData,
      questions: questions,
      lastModified: new Date().toLocaleDateString()
    };

    // Get existing surveys
    const existingSurveys = JSON.parse(localStorage.getItem('surveys') || '[]');
    
    if (surveyData.isEditMode) {
      // Update existing survey
      const updatedSurveys = existingSurveys.map(survey => 
        survey.id === completeSurvey.id ? completeSurvey : survey
      );
      localStorage.setItem('surveys', JSON.stringify(updatedSurveys));
    } else {
      // Add new survey
      const updatedSurveys = [...existingSurveys, completeSurvey];
      localStorage.setItem('surveys', JSON.stringify(updatedSurveys));
    }

    // Navigate to the survey view
    navigate(`/survey/${completeSurvey.id}`, { state: { survey: completeSurvey } });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDeleteQuestion = (questionId) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {surveyData.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Owner: {surveyData.owner}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Creation Date: {surveyData.creationDate}
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Survey Questions</Typography>

          {/* Questions list */}
          {questions.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              py: 4 
            }}>
              <Typography color="text.secondary" gutterBottom>
                No questions added yet
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Add Survey Question
              </Button>
            </Box>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={questions.map(q => q.id)}
                strategy={verticalListSortingStrategy}
              >
                <Box>
                  {questions.map((question, index) => (
                    <QuestionDisplay
                      key={question.id}
                      question={question}
                      index={index}
                      onEdit={(question) => {
                        const template = QUESTION_TYPES.find(t => t.id === question.type);
                        setSelectedQuestionType(template);
                        setQuestionConfig({
                          question: question.question,
                          ...question
                        });
                        setIsAddModalOpen(true);
                      }}
                      onDelete={handleDeleteQuestion}
                    />
                  ))}
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsAddModalOpen(true)}
                    sx={{ mt: 2 }}
                  >
                    Add Survey Question
                  </Button>
                </Box>
              </SortableContext>
            </DndContext>
          )}
        </Box>

        {/* Bottom buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button 
            variant="outlined" 
            onClick={() => {
              navigate('/create-survey', { 
                state: { 
                  returnData: location.state?.returnData,
                  editMode: location.state?.isEditMode,
                  surveyToEdit: location.state?.surveyData
                }
              });
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleSaveSurvey}
            disabled={questions.length === 0}
          >
            Continue
          </Button>
        </Box>

        {/* Question Template Modal */}
        <Dialog
          open={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedQuestionType(null);
            setQuestionConfig(null);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedQuestionType ? `Configure ${selectedQuestionType.label} Question` : 'Choose Question Type'}
          </DialogTitle>
          <DialogContent>
            {!selectedQuestionType ? (
              /* Question type selection */
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {QUESTION_TYPES.map((template) => (
                  <Grid item xs={12} sm={6} md={4} key={template.id}>
                    <Card
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <Typography variant="h4" sx={{ mb: 2 }}>
                        {template.icon}
                      </Typography>
                      <Typography variant="h6" align="center">
                        {template.label}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              /* Question configuration */
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Question Text"
                  value={questionConfig.question}
                  onChange={(e) => setQuestionConfig({ ...questionConfig, question: e.target.value })}
                  sx={{ mb: 3 }}
                />
                
                {selectedQuestionType.id === 'multiple-choice' && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>Options</Typography>
                    {questionConfig.options.map((option, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <TextField
                          fullWidth
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...questionConfig.options];
                            newOptions[index] = e.target.value;
                            setQuestionConfig({ ...questionConfig, options: newOptions });
                          }}
                        />
                        <IconButton 
                          onClick={() => {
                            const newOptions = questionConfig.options.filter((_, i) => i !== index);
                            setQuestionConfig({ ...questionConfig, options: newOptions });
                          }}
                          disabled={questionConfig.options.length <= 2}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setQuestionConfig({
                          ...questionConfig,
                          options: [...questionConfig.options, `Option ${questionConfig.options.length + 1}`]
                        });
                      }}
                      sx={{ mt: 1 }}
                    >
                      Add Option
                    </Button>
                  </Box>
                )}

                {selectedQuestionType.id === 'slider' && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>Scale Configuration</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <TextField
                          type="number"
                          label="Min Value"
                          value={questionConfig.min}
                          onChange={(e) => setQuestionConfig({ 
                            ...questionConfig, 
                            min: Number(e.target.value)
                          })}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          type="number"
                          label="Max Value"
                          value={questionConfig.max}
                          onChange={(e) => setQuestionConfig({ 
                            ...questionConfig, 
                            max: Number(e.target.value)
                          })}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          type="number"
                          label="Step"
                          value={questionConfig.step}
                          onChange={(e) => setQuestionConfig({ 
                            ...questionConfig, 
                            step: Number(e.target.value)
                          })}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {selectedQuestionType.id === 'numeric' && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>Input Configuration</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          type="number"
                          label="Min Value"
                          value={questionConfig.min}
                          onChange={(e) => setQuestionConfig({ 
                            ...questionConfig, 
                            min: Number(e.target.value)
                          })}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          type="number"
                          label="Max Value (optional)"
                          value={questionConfig.max || ''}
                          onChange={(e) => setQuestionConfig({ 
                            ...questionConfig, 
                            max: e.target.value ? Number(e.target.value) : null
                          })}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            {selectedQuestionType && (
              <Button 
                onClick={() => {
                  setSelectedQuestionType(null);
                  setQuestionConfig(null);
                }}
              >
                Back
              </Button>
            )}
            <Button onClick={() => {
              setIsAddModalOpen(false);
              setSelectedQuestionType(null);
              setQuestionConfig(null);
            }}>
              Cancel
            </Button>
            {selectedQuestionType && (
              <Button 
                variant="contained"
                onClick={() => {
                  const newQuestion = {
                    id: questionConfig.id || Date.now(),
                    type: selectedQuestionType.id,
                    ...questionConfig
                  };
                  
                  if (questionConfig.id) {
                    // Editing existing question
                    setQuestions(questions.map(q => 
                      q.id === questionConfig.id ? newQuestion : q
                    ));
                  } else {
                    // Adding new question
                    setQuestions([...questions, newQuestion]);
                  }
                  
                  setIsAddModalOpen(false);
                  setSelectedQuestionType(null);
                  setQuestionConfig(null);
                }}
                disabled={!questionConfig.question}
              >
                {questionConfig.id ? 'Save Changes' : 'Add Question'}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default SurveyQuestions; 