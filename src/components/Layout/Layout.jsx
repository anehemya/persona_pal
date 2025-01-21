import React from 'react';
import { Box } from '@mui/material';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';

const SIDEBAR_WIDTH = 250;

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#fafafa' }}>
      {/* Sidebar container */}
      <Box sx={{ 
        width: SIDEBAR_WIDTH, 
        flexShrink: 0,
        borderRight: '1px solid rgba(0, 0, 0, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'white'
      }}>
        {/* Gray box above sidebar */}
        <Box sx={{ 
          height: 64,
          bgcolor: '#f5f5f5',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
        }} />
        <Sidebar />
      </Box>

      {/* Main content area */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <Header />
        <Box component="main" sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          bgcolor: '#fafafa',
          px: 3,
          py: 2
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 