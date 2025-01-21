import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  TextField,
  InputAdornment
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import HistoryIcon from '@mui/icons-material/History';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search by title or by topic"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#f5f5f5',
              '&:hover': {
                bgcolor: '#f0f0f0',
              }
            }
          }}
        />
      </Box>
      <List sx={{ '& .MuiListItem-root': { borderRadius: 1 } }}>
        <ListItem
          button
          onClick={() => navigate('/')}
          selected={location.pathname === '/'}
        >
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem 
          button
          onClick={() => navigate('/recents')}
          selected={location.pathname === '/recents'}
        >
          <ListItemIcon>
            <HistoryIcon />
          </ListItemIcon>
          <ListItemText primary="Recents" />
        </ListItem>
        <ListItem 
          button
          onClick={() => navigate('/starred')}
          selected={location.pathname === '/starred'}
        >
          <ListItemIcon>
            <StarBorderIcon />
          </ListItemIcon>
          <ListItemText primary="Starred" />
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar; 