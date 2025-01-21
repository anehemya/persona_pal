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
  Grid,
  InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSurveys = React.useMemo(() => {
    // First apply the search filter
    let result = surveys;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(survey => 
        survey.name.toLowerCase().includes(query) || 
        survey.owner.toLowerCase().includes(query)
      );
    }

    // Then apply the type filter
    switch (filterType) {
      case 'starred':
        return result.filter(survey => starredSurveys.has(survey.id));
      case 'recent':
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        return result
          .filter(survey => {
            const surveyDate = new Date(survey.creationDate);
            return surveyDate >= sevenDaysAgo;
          })
          .sort((a, b) => {
            return new Date(b.creationDate) - new Date(a.creationDate);
          });
      default:
        return result;
    }
  }, [surveys, starredSurveys, filterType, searchQuery]);

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

  // Add a function to get the title based on filterType
  const getPageTitle = () => {
    switch (filterType) {
      case 'starred':
        return 'Starred surveys in this team';
      case 'recent':
        return 'Recent surveys in this team';
      default:
        return 'All surveys in this team';
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">{getPageTitle()}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
          sx={{ borderRadius: '20px' }}
        >
          Create new
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search surveys by name or owner..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            sx: { borderRadius: '20px' }
          }}
        />
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

      {filteredSurveys.length === 0 && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          py: 4 
        }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No surveys found
          </Typography>
          <Typography color="text.secondary">
            {searchQuery.trim() 
              ? 'Try adjusting your search terms'
              : filterType === 'starred'
                ? 'Star some surveys to see them here'
                : 'Create a new survey to get started'
            }
          </Typography>
        </Box>
      )}

      {filteredSurveys.length > 0 && (
        viewMode === 'list' ? renderListView() : renderGridView()
      )}

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