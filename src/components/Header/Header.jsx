import React from 'react';
import {
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Header = () => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        height: '64px',
        px: 3,
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        bgcolor: 'white',
      }}
    >
      <Typography 
        variant="h4"
        component="h1"
        sx={{ 
          fontWeight: 600,  // Slightly adjusted weight
          fontSize: '1.5rem',
          color: 'rgba(0, 0, 0, 0.87)'  // Darker text color
        }}
      >
        PersonaPal
      </Typography>
      <IconButton size="large" sx={{ color: 'rgba(0, 0, 0, 0.54)' }}>
        <AccountCircleIcon sx={{ fontSize: 32 }} />
      </IconButton>
    </Box>
  );
};

export default Header; 