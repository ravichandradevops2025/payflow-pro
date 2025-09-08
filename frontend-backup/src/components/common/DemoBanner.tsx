
import React from 'react';
import { Alert, AlertTitle, Box, Button, Link } from '@mui/material';
import { Info, GitHub } from '@mui/icons-material';

const DemoBanner: React.FC = () => {
  const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true' || 
                    window.location.hostname.includes('github.io');

  if (!isDemoMode) return null;

  return (
    <Alert 
      severity="info" 
      sx={{ 
        mb: 2,
        '& .MuiAlert-message': { width: '100%' }
      }}
      icon={<Info />}
    >
      <AlertTitle>íº€ Live Demo Mode</AlertTitle>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <span>
          This is a demo version with sample data. 
          <strong> Login:</strong> admin@payflow.com / password123
        </span>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<GitHub />}
            href="https://github.com/YOUR_USERNAME/payflow-pro"
            target="_blank"
          >
            View Source
          </Button>
        </Box>
      </Box>
    </Alert>
  );
};

export default DemoBanner;
