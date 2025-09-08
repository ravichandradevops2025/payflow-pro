
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  CssBaseline, 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Alert, 
  Button,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { GitHub, Launch, Business, People, Payment, Assessment } from '@mui/icons-material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <Card elevation={2}>
    <CardContent sx={{ textAlign: 'center', p: 3 }}>
      <Box sx={{ color: 'primary.main', mb: 2 }}>
        {icon}
      </Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Demo Banner */}
          <Alert 
            severity="info" 
            sx={{ mb: 4 }}
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  size="small" 
                  startIcon={<GitHub />}
                  href="https://github.com/YOUR_USERNAME/payflow-pro"
                  target="_blank"
                  color="inherit"
                >
                  Source
                </Button>
              </Box>
            }
          >
            Ì∫Ä PayFlow Pro - Live Demo | Full-featured payroll management system
          </Alert>

          {/* Hero Section */}
          <Paper elevation={3} sx={{ p: 6, textAlign: 'center', mb: 4 }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Ì≤º PayFlow Pro
            </Typography>
            <Typography variant="h5" color="text.secondary" paragraph>
              Complete Payroll & Employee Management System
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
              A modern, secure, and scalable solution for managing employees, processing payroll, 
              tracking attendance, and generating comprehensive reports.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<GitHub />}
                href="https://github.com/YOUR_USERNAME/payflow-pro"
                target="_blank"
              >
                View Source Code
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                startIcon={<Launch />}
                href="https://github.com/YOUR_USERNAME/payflow-pro#readme"
                target="_blank"
              >
                Documentation
              </Button>
            </Box>
          </Paper>

          {/* Features Grid */}
          <Typography variant="h4" component="h2" gutterBottom textAlign="center" sx={{ mb: 4 }}>
            Ìºü Key Features
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                icon={<People sx={{ fontSize: 48 }} />}
                title="Employee Management"
                description="Complete employee profiles, organizational hierarchy, and document management with role-based access control."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                icon={<Payment sx={{ fontSize: 48 }} />}
                title="Payroll Processing"
                description="Automated salary calculations, tax deductions, statutory compliance, and digital payslip generation."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                icon={<Business sx={{ fontSize: 48 }} />}
                title="Attendance & Leave"
                description="Time tracking, leave management, approval workflows, and integration with biometric systems."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                icon={<Assessment sx={{ fontSize: 48 }} />}
                title="Reports & Analytics"
                description="Comprehensive reporting, business insights, compliance reports, and custom dashboard analytics."
              />
            </Grid>
          </Grid>

          {/* Tech Stack */}
          <Paper sx={{ p: 4, mb: 4 }}>
            <Typography variant="h5" component="h3" gutterBottom textAlign="center">
              Ìª†Ô∏è Technology Stack
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Frontend</Typography>
                <Typography variant="body2" paragraph>
                  ‚Ä¢ React 18 with TypeScript<br/>
                  ‚Ä¢ Material-UI (MUI) Components<br/>
                  ‚Ä¢ Redux Toolkit for State Management<br/>
                  ‚Ä¢ React Router for Navigation<br/>
                  ‚Ä¢ Responsive Design
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Backend</Typography>
                <Typography variant="body2" paragraph>
                  ‚Ä¢ Node.js with Express.js<br/>
                  ‚Ä¢ PostgreSQL Database<br/>
                  ‚Ä¢ Redis for Caching<br/>
                  ‚Ä¢ JWT Authentication<br/>
                  ‚Ä¢ Docker Containerization
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Demo Features */}
          <Paper sx={{ p: 4, bgcolor: 'primary.main', color: 'white', textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              ‚ú® Demo Highlights
            </Typography>
            <Typography variant="body1" paragraph>
              This GitHub Pages demo showcases the frontend interface and user experience.
              The complete application includes backend API, database integration, real-time features,
              and enterprise-grade security measures.
            </Typography>
            <Typography variant="body2">
              <strong>Login Credentials:</strong> admin@payflow.com / password123
            </Typography>
          </Paper>
        </Container>
      </Router>
    </ThemeProvider>
  );
};

export default App;
