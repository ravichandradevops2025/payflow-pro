
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Typography, Paper, Box, Alert } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from './store';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

const DemoPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        Ì∫Ä PayFlow Pro - Live Demo | Login: admin@payflow.com / password123
      </Alert>
      
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          Ì≤º PayFlow Pro
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Complete Payroll & Employee Management System
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Ìºü Features
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mt: 2 }}>
            <Paper sx={{ p: 2 }} elevation={2}>
              <Typography variant="subtitle1">Ì±• Employee Management</Typography>
              <Typography variant="body2">Complete employee profiles and organizational hierarchy</Typography>
            </Paper>
            <Paper sx={{ p: 2 }} elevation={2}>
              <Typography variant="subtitle1">Ì≤∞ Payroll Processing</Typography>
              <Typography variant="body2">Automated salary calculations and tax deductions</Typography>
            </Paper>
            <Paper sx={{ p: 2 }} elevation={2}>
              <Typography variant="subtitle1">Ì≥ä Reports & Analytics</Typography>
              <Typography variant="body2">Comprehensive reporting and insights</Typography>
            </Paper>
            <Paper sx={{ p: 2 }} elevation={2}>
              <Typography variant="subtitle1">Ì¥ê Security & Compliance</Typography>
              <Typography variant="body2">Role-based access control and audit logging</Typography>
            </Paper>
          </Box>
        </Box>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="body1">
            This is a demo version showcasing the PayFlow Pro interface and features.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Built with React, TypeScript, Material-UI, Node.js, and PostgreSQL
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="*" element={<DemoPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
