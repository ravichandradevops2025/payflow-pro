
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { store } from '../store';
import { refreshAccessToken, logout } from '../store/slices/authSlice';
import { demoAPI, isDemoMode } from './demoApi';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api/v1';

// Create axios instance only if not in demo mode
let api: AxiosInstance;

if (!isDemoMode()) {
  api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  api.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      const state = store.getState();
      const token = state.auth.accessToken;
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token refresh
  api.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          await store.dispatch(refreshAccessToken());
          
          const state = store.getState();
          const newToken = state.auth.accessToken;
          
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          store.dispatch(logout());
          window.location.href = '/login';
        }
      }
      
      return Promise.reject(error);
    }
  );
}

// Auth API
export const authAPI = isDemoMode() ? {
  login: demoAPI.login,
  logout: demoAPI.logout,
  getProfile: demoAPI.getProfile,
  refreshToken: (data: any) => Promise.resolve({ data: { accessToken: 'demo-token' } }),
  changePassword: (data: any) => Promise.resolve({ data: { success: true } })
} : {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  logout: () =>
    api.post('/auth/logout'),
  
  getProfile: () =>
    api.get('/auth/me'),
  
  refreshToken: (data: { refreshToken: string }) =>
    api.post('/auth/refresh-token', data),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/auth/change-password', data),
};

// Employee API
export const employeeAPI = isDemoMode() ? {
  getEmployees: demoAPI.getEmployees,
  getEmployee: demoAPI.getEmployee,
  getDepartments: demoAPI.getDepartments,
  getDesignations: demoAPI.getDesignations,
  createEmployee: (data: any) => Promise.resolve({ data: { success: true } }),
  updateEmployee: (id: string, data: any) => Promise.resolve({ data: { success: true } }),
  deactivateEmployee: (id: string, data?: any) => Promise.resolve({ data: { success: true } }),
  activateEmployee: (id: string) => Promise.resolve({ data: { success: true } }),
  getEmployeeSalaryStructure: (id: string) => Promise.resolve({ data: [] }),
  createSalaryStructure: (id: string, data: any) => Promise.resolve({ data: { success: true } })
} : {
  getEmployees: (params?: any) =>
    api.get('/employees', { params }),
  
  getEmployee: (id: string) =>
    api.get(`/employees/${id}`),
  
  createEmployee: (data: any) =>
    api.post('/employees', data),
  
  updateEmployee: (id: string, data: any) =>
    api.put(`/employees/${id}`, data),
  
  deactivateEmployee: (id: string, data?: any) =>
    api.patch(`/employees/${id}/deactivate`, data),
  
  activateEmployee: (id: string) =>
    api.patch(`/employees/${id}/activate`),
  
  getEmployeeSalaryStructure: (id: string) =>
    api.get(`/employees/${id}/salary-structure`),
  
  createSalaryStructure: (id: string, data: any) =>
    api.post(`/employees/${id}/salary-structure`, data),
  
  getDepartments: () =>
    api.get('/employees/departments'),
  
  getDesignations: (departmentId?: string) =>
    api.get('/employees/designations', { params: { department_id: departmentId } }),
};

// Payroll API
export const payrollAPI = isDemoMode() ? {
  getPayrollRuns: demoAPI.getPayrollRuns,
  getPayrollRun: (id: string) => Promise.resolve({ data: demoAPI.payrollRuns[0] }),
  createPayrollRun: (data: any) => Promise.resolve({ data: { success: true } }),
  processPayroll: (id: string) => Promise.resolve({ data: { success: true } }),
  approvePayroll: (id: string) => Promise.resolve({ data: { success: true } }),
  getPayrollItems: (id: string, params?: any) => Promise.resolve({ data: { data: [] } }),
  getEmployeePayslips: (employeeId: string, params?: any) => Promise.resolve({ data: [] })
} : {
  getPayrollRuns: (params?: any) =>
    api.get('/payroll/runs', { params }),
  
  getPayrollRun: (id: string) =>
    api.get(`/payroll/runs/${id}`),
  
  createPayrollRun: (data: any) =>
    api.post('/payroll/runs', data),
  
  processPayroll: (id: string) =>
    api.post(`/payroll/runs/${id}/process`),
  
  approvePayroll: (id: string) =>
    api.post(`/payroll/runs/${id}/approve`),
  
  getPayrollItems: (id: string, params?: any) =>
    api.get(`/payroll/runs/${id}/items`, { params }),
  
  getEmployeePayslips: (employeeId: string, params?: any) =>
    api.get(`/payroll/employees/${employeeId}/payslips`, { params }),
};

export default isDemoMode() ? null : api;
