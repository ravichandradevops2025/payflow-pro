
// Mock API for GitHub Pages Demo
export const mockEmployees = [
  {
    id: '1',
    employee_code: 'EMP001',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@company.com',
    department_name: 'Engineering',
    designation_title: 'Senior Developer',
    is_active: true,
    joining_date: '2023-01-15'
  },
  {
    id: '2',
    employee_code: 'EMP002',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@company.com',
    department_name: 'Human Resources',
    designation_title: 'HR Manager',
    is_active: true,
    joining_date: '2022-06-10'
  }
];

export const mockPayrollRuns = [
  {
    id: '1',
    payroll_period_start: '2024-01-01',
    payroll_period_end: '2024-01-31',
    status: 'approved',
    total_employees: 25,
    total_gross_salary: 1250000,
    total_net_salary: 1050000,
    created_at: '2024-02-01'
  }
];

// Mock API functions
export const mockAPI = {
  login: (credentials: any) => 
    Promise.resolve({
      data: {
        user: { id: '1', email: credentials.email, role: 'hr_admin' },
        accessToken: 'mock-token',
        employee: mockEmployees[0]
      }
    }),
  
  getEmployees: () => 
    Promise.resolve({
      data: {
        data: mockEmployees,
        pagination: { page: 1, limit: 20, total: 2, totalPages: 1 }
      }
    }),
  
  getPayrollRuns: () =>
    Promise.resolve({
      data: {
        data: mockPayrollRuns,
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
      }
    })
};
