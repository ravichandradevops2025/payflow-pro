
import { mockAPI } from './mockApi';

// Check if we're in demo mode
const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true';

// Use mock API in demo mode, real API otherwise
export const api = isDemoMode ? mockAPI : require('./api').default;

export const authAPI = isDemoMode ? {
  login: mockAPI.login,
  logout: () => Promise.resolve({ data: { success: true } }),
  getProfile: () => Promise.resolve({ 
    data: { 
      user: { id: '1', email: 'demo@payflow.com', role: 'hr_admin' },
      employee: null 
    }
  })
} : require('./api').authAPI;

export const employeeAPI = isDemoMode ? {
  getEmployees: mockAPI.getEmployees,
  getDepartments: () => Promise.resolve({ 
    data: [
      { id: '1', name: 'Engineering', code: 'ENG' },
      { id: '2', name: 'Human Resources', code: 'HR' }
    ]
  })
} : require('./api').employeeAPI;
