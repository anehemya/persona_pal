import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Grid,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  TextareaAutosize,
  Checkbox,
  InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout/Layout';

// Updated colors to match the image
const COLORS = ['#FFD700', '#87CEEB', '#90EE90', '#DDA0DD'];

const DEMOGRAPHIC_OPTIONS = [
  { id: 'age', label: 'Age' },
  { id: 'gender', label: 'Gender' },
  { id: 'income', label: 'Income' },
  { id: 'education', label: 'Educational Level' },
  { id: 'ethnicity', label: 'Ethnicity' },
  { id: 'political', label: 'Political Affiliation' },
  { id: 'location', label: 'Urban/Rural' },
  { id: 'social', label: 'Social Media Exposure' },
  { id: 'environmental', label: 'Environmentally Conscious' },
  { id: 'health', label: 'Physical Health' },
];

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

const CreateSurvey = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isEditMode = location.state?.editMode;
  const surveyToEdit = location.state?.surveyToEdit;
  const returnData = location.state?.returnData;

  // Add console log to see what data we're getting
  console.log('Location State:', location.state);
  console.log('Return Data:', returnData);

  // Initialize states with returnData if it exists
  const [selectedDemographics, setSelectedDemographics] = useState(() => {
    if (returnData?.selectedDemographics) {
      return returnData.selectedDemographics;
    }
    return isEditMode ? surveyToEdit?.demographics : [];
  });

  const [customInformation, setCustomInformation] = useState(() => {
    if (returnData?.customInformation) {
      return returnData.customInformation;
    }
    return isEditMode ? surveyToEdit?.customInformation : '';
  });

  const [customChartName, setCustomChartName] = useState('');
  const [editingDemographic, setEditingDemographic] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentRanges, setCurrentRanges] = useState([]);
  const [newRangeLabel, setNewRangeLabel] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState([]);

  const surveyName = returnData?.surveyName || 
    (isEditMode ? surveyToEdit.name : (location.state?.surveyName || 'Untitled Survey'));

  const handleDemographicClick = (demographic) => {
    setEditingDemographic(demographic);
    setCurrentRanges(demographic.ranges || []);
    setEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setEditModalOpen(false);
    setEditingDemographic(null);
    setCurrentRanges([]);
  };

  const handleDeleteRange = (index) => {
    const newRanges = currentRanges.filter((_, i) => i !== index);
    
    // If there are remaining ranges, redistribute the deleted range's percentage
    if (newRanges.length > 0) {
      const deletedValue = currentRanges[index].value;
      const totalRemaining = newRanges.reduce((sum, r) => sum + r.value, 0);
      
      // Distribute the deleted value proportionally among remaining ranges
      newRanges.forEach(range => {
        range.value += (range.value / totalRemaining) * deletedValue;
      });
    }
    
    setCurrentRanges(newRanges);
  };

  const renderDemographicCard = (demographic) => (
    <Card 
      sx={{ 
        p: 2, 
        cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' },
        height: '350px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
      onClick={() => selectedToDelete.length > 0
        ? handleToggleDelete(demographic.id)
        : handleDemographicClick(demographic)
      }
    >
      {selectedToDelete.length > 0 && (
        <Checkbox
          checked={selectedToDelete.includes(demographic.id)}
          sx={{ 
            position: 'absolute',
            top: 8,
            right: 8,
            '&:hover': { bgcolor: 'transparent' }
          }}
          onClick={(e) => e.stopPropagation()}
          onChange={() => handleToggleDelete(demographic.id)}
        />
      )}
      <Typography variant="h6" gutterBottom>
        {demographic.label}
      </Typography>
      {demographic.ranges && demographic.ranges.length > 0 && (
        <>
          <Box sx={{ 
            height: '200px',
            width: '200px',
            position: 'relative',
            margin: '0 auto',
            flexShrink: 0
          }}>
            <StablePieChart data={demographic.ranges} />
          </Box>
          <Box sx={{ 
            mt: 'auto', 
            pt: 1, 
            borderTop: '1px solid #eee',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.5,
            maxHeight: '80px',
            overflow: 'auto'
          }}>
            {demographic.ranges.map((range, index) => (
              <Typography 
                key={index} 
                variant="caption" 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  mr: 1,
                  fontSize: '13px',
                  fontWeight: 500,
                  whiteSpace: 'nowrap'
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: COLORS[index % COLORS.length],
                    mr: 0.5,
                    display: 'inline-block'
                  }}
                />
                {range.label}: {Math.round(range.value)}%
              </Typography>
            ))}
          </Box>
        </>
      )}
    </Card>
  );

  const handleEditClick = () => {
    // Enable selection mode by adding a dummy ID to selectedToDelete
    setSelectedToDelete(['temp']);  // This enables selection mode
  };

  const handleCancelEdit = () => {
    // Clear selection mode
    setSelectedToDelete([]);
  };

  const handleDeleteSelected = () => {
    // Filter out the temp ID and actually delete the selected items
    const realSelectedIds = selectedToDelete.filter(id => id !== 'temp');
    setSelectedDemographics(
      selectedDemographics.filter(demo => !realSelectedIds.includes(demo.id))
    );
    setSelectedToDelete([]);
  };

  const handleToggleDelete = (demographicId) => {
    setSelectedToDelete(prev => {
      // Keep 'temp' in the array to maintain selection mode
      const tempId = prev.find(id => id === 'temp');
      const newSelected = prev.filter(id => id !== 'temp' && id !== demographicId);
      
      if (!prev.includes(demographicId)) {
        newSelected.push(demographicId);
      }
      
      // Always include temp if it existed
      if (tempId) {
        newSelected.push(tempId);
      }
      
      return newSelected;
    });
  };

  const handleSaveSurvey = () => {
    const surveyData = {
      id: isEditMode ? surveyToEdit.id : Date.now(),
      name: surveyName,
      owner: "Akiva Yeshurun",
      creationDate: isEditMode ? surveyToEdit.creationDate : new Date().toLocaleDateString(),
      lastModified: new Date().toLocaleDateString(),
      demographics: selectedDemographics,
      customInformation: customInformation
    };

    navigate('/survey-questions', { 
      state: { 
        surveyData,
        isEditMode,
        returnData: {
          selectedDemographics,
          customInformation,
          surveyName,
          isEditMode,
          surveyToEdit
        }
      },
      replace: false  // Make sure we're not replacing the history
    });
  };

  const handleSaveChanges = () => {
    // For custom charts, validate name
    if (editingDemographic.id.startsWith('custom-') && !customChartName.trim()) {
      alert('Please enter a name for your custom chart');
      return;
    }
    
    const isNewDemographic = !selectedDemographics.find(d => d.id === editingDemographic.id);
    
    if (isNewDemographic) {
      setSelectedDemographics([
        ...selectedDemographics,
        { 
          ...editingDemographic, 
          label: editingDemographic.id.startsWith('custom-') ? customChartName : editingDemographic.label,
          ranges: currentRanges 
        }
      ]);
    } else {
      const updatedDemographics = selectedDemographics.map(demo => 
        demo.id === editingDemographic.id 
          ? { 
              ...demo, 
              label: demo.id.startsWith('custom-') ? customChartName : demo.label,
              ranges: currentRanges 
            }
          : demo
      );
      setSelectedDemographics(updatedDemographics);
    }
    
    setCustomChartName('');
    handleCloseEdit();
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        {/* Update title based on mode */}
        <Typography variant="h5" gutterBottom>
          {isEditMode ? 'Edit Survey' : surveyName}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Owner: Akiva Yeshurun
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Creation Date: {new Date().toLocaleDateString()}
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Demographics</Typography>
          <Typography variant="subtitle1" gutterBottom>Customer</Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {selectedDemographics.map((demographic) => (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                lg={3}
                key={demographic.id}
                sx={{ minWidth: '200px' }}
              >
                {renderDemographicCard(demographic)}
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            {selectedToDelete.length > 0 ? (
              <>
                <Button 
                  variant="contained" 
                  color="error" 
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteSelected}
                  disabled={selectedToDelete.filter(id => id !== 'temp').length === 0}
                >
                  Delete Selected ({selectedToDelete.filter(id => id !== 'temp').length})
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={handleEditClick}
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setAddModalOpen(true)}
                >
                  Add more
                </Button>
              </>
            )}
          </Box>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Custom Information</Typography>
          <TextareaAutosize
            minRows={5}
            value={customInformation}
            onChange={(e) => setCustomInformation(e.target.value)}
            placeholder="Enter custom demographic information here..."
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontFamily: 'inherit'
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate(isEditMode ? `/survey/${surveyToEdit.id}` : '/')}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleSaveSurvey}
            disabled={selectedDemographics.length === 0}
          >
            {isEditMode ? 'Save Changes' : 'Continue'}
          </Button>
        </Box>

        {/* Updated Edit Dialog */}
        <Dialog 
          open={editModalOpen} 
          onClose={handleCloseEdit}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingDemographic?.id.startsWith('custom-') ? 'Custom Chart' : editingDemographic?.label}
          </DialogTitle>
          <DialogContent>
            {/* Add name field for custom charts */}
            {editingDemographic?.id.startsWith('custom-') && (
              <TextField
                fullWidth
                label="Chart Name"
                value={customChartName}
                onChange={(e) => setCustomChartName(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="Enter a name for your custom chart"
              />
            )}

            <Box sx={{ display: 'flex', gap: 4, my: 2, height: '400px' }}>  {/* Fixed height container */}
              {/* Left side - Number Inputs with scroll */}
              <Box sx={{ 
                flex: 1,
                overflow: 'auto',  // Make it scrollable
                pr: 2,  // Add padding for the scrollbar
                maxHeight: '100%'  // Ensure it doesn't exceed container
              }}>
                {currentRanges.map((range, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    mb: 2,
                    minHeight: 'fit-content'  // Ensure items don't shrink
                  }}>
                    <TextField
                      label={range.label}
                      type="number"
                      value={range.value}
                      onChange={(e) => {
                        const newValue = Math.min(100, Math.max(0, Number(e.target.value)));
                        const newRanges = [...currentRanges];
                        newRanges[index].value = newValue;
                        
                        // Auto-distribute remaining percentage
                        const total = newRanges.reduce((sum, r) => sum + r.value, 0);
                        if (total > 100) {
                          // Adjust other values proportionally
                          const excess = total - 100;
                          const othersTotal = total - newValue;
                          newRanges.forEach((r, i) => {
                            if (i !== index && othersTotal > 0) {
                              r.value = Math.max(0, r.value - (excess * (r.value / othersTotal)));
                            }
                          });
                        }
                        
                        setCurrentRanges(newRanges);
                      }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      sx={{ width: 120 }}
                    />
                    <Typography sx={{ flex: 1 }}>{range.label}</Typography>
                    <IconButton onClick={() => handleDeleteRange(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}

                {/* Show remaining percentage - stick to bottom */}
                <Box sx={{ 
                  position: 'sticky', 
                  bottom: 0, 
                  bgcolor: 'background.paper',
                  pt: 2,
                  borderTop: '1px solid rgba(0, 0, 0, 0.12)'
                }}>
                  <Typography color="text.secondary">
                    Remaining: {100 - currentRanges.reduce((sum, r) => sum + r.value, 0)}%
                  </Typography>

                  {/* Add new range */}
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <TextField
                      label="New Range"
                      value={newRangeLabel}
                      onChange={(e) => setNewRangeLabel(e.target.value)}
                    />
                    <Button 
                      variant="outlined" 
                      onClick={() => {
                        if (newRangeLabel.trim()) {
                          const remaining = 100 - currentRanges.reduce((sum, r) => sum + r.value, 0);
                          setCurrentRanges([
                            ...currentRanges, 
                            { label: newRangeLabel.trim(), value: remaining }
                          ]);
                          setNewRangeLabel('');
                        }
                      }}
                    >
                      Add Range
                    </Button>
                  </Box>
                </Box>
              </Box>

              {/* Right side - Pie Chart with fixed size */}
              <Box sx={{ 
                width: '400px',  // Fixed width
                height: '100%',  // Take full height of container
                flexShrink: 0,   // Prevent chart from shrinking
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Box sx={{ 
                  width: '300px',  // Fixed size for chart
                  height: '300px',
                  position: 'relative'
                }}>
                  <StablePieChart data={currentRanges} />
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEdit}>Cancel</Button>
            <Button 
              onClick={() => {
                const total = currentRanges.reduce((sum, r) => sum + r.value, 0);
                if (total === 100) {
                  handleSaveChanges();
                } else {
                  alert('Total must equal 100%');
                }
              }}
              variant="contained"
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Remove the Menu component and keep the Dialog */}
        <Dialog
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Add Demographic</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {DEMOGRAPHIC_OPTIONS
                .filter(option => !selectedDemographics.find(d => d.id === option.id))
                .map((option) => (
                  <Grid item xs={12} sm={6} md={4} key={option.id}>
                    <Card
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        height: '100%'
                      }}
                      onClick={() => {
                        setEditingDemographic(option);
                        setCurrentRanges(option.ranges || []);
                        setEditModalOpen(true);
                        setAddModalOpen(false);
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        {option.label}
                      </Typography>
                      {option.ranges && (
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <PieChart width={100} height={100}>
                            <Pie
                              data={option.ranges}
                              dataKey="value"
                              nameKey="label"
                              cx="50%"
                              cy="50%"
                              outerRadius={40}
                            >
                              {option.ranges.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </Box>
                      )}
                    </Card>
                  </Grid>
                ))}
                
                {/* Custom Chart Option */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      border: '2px dashed grey'
                    }}
                    onClick={() => {
                      const customDemographic = {
                        id: `custom-${Date.now()}`,
                        label: 'Custom Chart',
                        ranges: [
                          { label: 'Option 1', value: 50 },
                          { label: 'Option 2', value: 50 }
                        ]
                      };
                      setEditingDemographic(customDemographic);
                      setCurrentRanges(customDemographic.ranges);
                      setEditModalOpen(true);
                      setAddModalOpen(false);
                    }}
                  >
                    <AddIcon sx={{ fontSize: 40, color: 'grey.500' }} />
                    <Typography variant="h6" color="text.secondary">
                      Custom Chart
                    </Typography>
                  </Card>
                </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default CreateSurvey; 