import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import DeleteIcon from '@mui/icons-material/Delete';

const SurveyList = ({ filterType = 'all' }) => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('last-opened');
  const [viewMode, setViewMode] = useState('list');
  const [surveys, setSurveys] = useState(() => {
    return JSON.parse(localStorage.getItem('surveys') || '[]');
  });
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [newSurveyName, setNewSurveyName] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [starredSurveys, setStarredSurveys] = useState(() => {
    return new Set(JSON.parse(localStorage.getItem('starredSurveys') || '[]'));
  });

  const filteredSurveys = React.useMemo(() => {
    switch (filterType) {
      case 'starred':
        return surveys.filter(survey => starredSurveys.has(survey.id));
      case 'recent':
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        return surveys
          .filter(survey => {
            const surveyDate = new Date(survey.creationDate);
            return surveyDate >= sevenDaysAgo;
          })
          .sort((a, b) => {
            // Sort by creation date, newest first
            return new Date(b.creationDate) - new Date(a.creationDate);
          });
      default:
        return surveys;
    }
  }, [surveys, starredSurveys, filterType]);

  // First filter, then sort the surveys
  const sortedAndFilteredSurveys = React.useMemo(() => {
    // First apply the filter
    let result = [...filteredSurveys];

    // Then apply the sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'date':
        result.sort((a, b) => {
          return new Date(b.creationDate) - new Date(a.creationDate);
        });
        break;
      case 'last-opened':
        result.sort((a, b) => {
          const aDate = a.lastOpenedDate ? new Date(a.lastOpenedDate) : new Date(a.creationDate);
          const bDate = b.lastOpenedDate ? new Date(b.lastOpenedDate) : new Date(b.creationDate);
          return bDate - aDate;
        });
        break;
      default:
        break;
    }

    return result;
  }, [filteredSurveys, sortBy]);

  const handleCreateNew = () => {
    setIsNameDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsNameDialogOpen(false);
    setNewSurveyName('');
  };

  const handleCreateSurvey = () => {
    if (newSurveyName.trim()) {
      navigate('/create-survey', { state: { surveyName: newSurveyName.trim() } });
      handleCloseDialog();
    }
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleSurveyClick = (survey) => {
    // Update the last opened date
    const updatedSurvey = { 
      ...survey, 
      lastOpenedDate: new Date().toISOString() 
    };
    
    // Update in localStorage
    const updatedSurveys = surveys.map(s => 
      s.id === survey.id ? updatedSurvey : s
    );
    localStorage.setItem('surveys', JSON.stringify(updatedSurveys));
    setSurveys(updatedSurveys);

    // Navigate to the survey
    navigate(`/survey/${survey.id}`, { state: { survey: updatedSurvey } });
  };

  const handleMenuOpen = (event, survey) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedSurvey(survey);
  };

  const handleMenuClose = (event) => {
    if (event) {
      event.stopPropagation();
    }
    setAnchorEl(null);
    setSelectedSurvey(null);
  };

  const handleDeleteSurvey = (event) => {
    event.stopPropagation();
    const updatedSurveys = surveys.filter(s => s.id !== selectedSurvey.id);
    localStorage.setItem('surveys', JSON.stringify(updatedSurveys));
    setSurveys(updatedSurveys);
    handleMenuClose();
  };

  const handleToggleStar = (event, survey) => {
    event.stopPropagation();
    const newStarredSurveys = new Set(starredSurveys);
    
    if (starredSurveys.has(survey.id)) {
      newStarredSurveys.delete(survey.id);
    } else {
      newStarredSurveys.add(survey.id);
    }
    
    setStarredSurveys(newStarredSurveys);
    localStorage.setItem('starredSurveys', JSON.stringify([...newStarredSurveys]));
  };

  const StarButton = ({ survey }) => (
    <IconButton 
      size="small"
      onClick={(e) => handleToggleStar(e, survey)}
    >
      {starredSurveys.has(survey.id) ? <StarIcon color="primary" /> : <StarBorderIcon />}
    </IconButton>
  );

  const renderListView = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedAndFilteredSurveys.map((survey) => (
            <TableRow 
              key={survey.id} 
              hover
              onClick={() => handleSurveyClick(survey)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>
                <Box>
                  <Typography variant="body1">{survey.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Created {survey.creationDate}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>{survey.owner}</TableCell>
              <TableCell align="right">
                <StarButton survey={survey} />
                <IconButton 
                  size="small"
                  onClick={(e) => handleMenuOpen(e, survey)}
                >
                  <MoreHorizIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderGridView = () => (
    <Grid container spacing={2}>
      {sortedAndFilteredSurveys.map((survey) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={survey.id}>
          <Card 
            sx={{ 
              height: '100%',
              cursor: 'pointer',
              '&:hover': { boxShadow: 3 }
            }}
            onClick={() => handleSurveyClick(survey)}
          >
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start'
              }}>
                <Typography variant="h6" gutterBottom>
                  {survey.name}
                </Typography>
                <Box>
                  <StarButton survey={survey} />
                  <IconButton 
                    size="small"
                    onClick={(e) => handleMenuOpen(e, survey)}
                  >
                    <MoreHorizIcon />
                  </IconButton>
                </Box>
              </Box>
              <Typography color="text.secondary" gutterBottom>
                Owner: {survey.owner}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Created {survey.creationDate}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Surveys in this team</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
          sx={{ borderRadius: '20px' }}
        >
          Create new
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography>Sort by</Typography>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="last-opened">Last opened</MenuItem>
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="date">Date created</MenuItem>
          </Select>
        </Box>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
        >
          <ToggleButton value="grid">
            <GridViewIcon />
          </ToggleButton>
          <ToggleButton value="list">
            <ViewListIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Render view based on viewMode */}
      {viewMode === 'list' ? renderListView() : renderGridView()}

      <Dialog 
        open={isNameDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Name Survey</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            placeholder="e.g. Survey x"
            value={newSurveyName}
            onChange={(e) => setNewSurveyName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateSurvey();
              }
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateSurvey}
            variant="contained"
            disabled={!newSurveyName.trim()}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={handleDeleteSurvey}
          sx={{ 
            color: 'error.main',
            '&:hover': { bgcolor: 'error.lighter' }
          }}
        >
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete Survey
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default SurveyList; 