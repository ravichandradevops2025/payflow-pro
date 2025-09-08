
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { store } from '../store';
import { refreshAccessToken, logout } from '../store/slices/authSlice';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
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
       
       // Retry the original request
       const state = store.getState();
       const newToken = state.auth.accessToken;
       
       if (newToken) {
         originalRequest.headers.Authorization = `Bearer ${newToken}`;
         return api(originalRequest);
       }
     } catch (refreshError) {
       // Refresh failed, logout user
       store.dispatch(logout());
       window.location.href = '/login';
     }
   }
   
   return Promise.reject(error);
 }
);

// Auth API
export const authAPI = {
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
export const employeeAPI = {
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
export const payrollAPI = {
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

export default api;
