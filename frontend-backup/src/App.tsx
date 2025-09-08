
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { getProfile } from './store/slices/authSlice';

// Components
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import Notification from './components/common/Notification';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeForm from './pages/employees/EmployeeForm';
import EmployeeDetail from './pages/employees/EmployeeDetail';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(getProfile() as any);
    }
  }, [dispatch, isAuthenticated, user]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
              }
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      
                      {/* Employee Routes */}
                      <Route
                        path="/employees"
                        element={
                          <ProtectedRoute requiredRoles={['super_admin', 'hr_admin']}>
                            <EmployeeList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/employees/new"
                        element={
                          <ProtectedRoute requiredRoles={['super_admin', 'hr_admin']}>
                            <EmployeeForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/employees/:id"
                        element={
                          <ProtectedRoute>
                            <EmployeeDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/employees/:id/edit"
                        element={
                          <ProtectedRoute requiredRoles={['super_admin', 'hr_admin']}>
                            <EmployeeForm />
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Placeholder routes for other modules */}
                      <Route
                        path="/payroll/*"
                        element={
                          <ProtectedRoute requiredRoles={['super_admin', 'hr_admin', 'payroll_admin']}>
                            <div>Payroll Module - Coming Soon</div>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/attendance/*"
                        element={
                          <ProtectedRoute>
                            <div>Attendance Module - Coming Soon</div>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/leave/*"
                        element={
                          <ProtectedRoute>
                            <div>Leave Module - Coming Soon</div>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/reports/*"
                        element={
                          <ProtectedRoute requiredRoles={['super_admin', 'hr_admin', 'payroll_admin']}>
                            <div>Reports Module - Coming Soon</div>
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Catch all route */}
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Unauthorized route */}
            <Route
              path="/unauthorized"
              element={
                <div style={{ textAlign: 'center', marginTop: '100px' }}>
                  <h1>Unauthorized</h1>
                  <p>You don't have permission to access this page.</p>
                </div>
              }
            />

            {/* Catch all redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
        <Notification />
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
