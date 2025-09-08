
// Demo API for GitHub Pages
export const demoData = {
  user: {
    id: '1',
    email: 'demo@payflow.com',
    role: 'hr_admin' as const,
    name: 'Demo User'
  },
  employees: [
    {
      id: '1',
      employee_code: 'EMP001',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@company.com',
      department_name: 'Engineering',
      designation_title: 'Senior Developer',
      is_active: true,
      joining_date: '2023-01-15',
      phone: '+1-555-0101'
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
      joining_date: '2022-06-10',
      phone: '+1-555-0102'
    },
    {
      id: '3',
      employee_code: 'EMP003',
      first_name: 'Mike',
      last_name: 'Johnson', 
      email: 'mike.johnson@company.com',
      department_name: 'Finance',
      designation_title: 'Finance Manager',
      is_active: true,
      joining_date: '2023-03-20',
      phone: '+1-555-0103'
    }
  ],
  departments: [
    { id: '1', name: 'Engineering', code: 'ENG' },
    { id: '2', name: 'Human Resources', code: 'HR' },
    { id: '3', name: 'Finance', code: 'FIN' },
    { id: '4', name: 'Marketing', code: 'MKT' }
  ],
  designations: [
    { id: '1', title: 'Senior Developer', department_id: '1' },
    { id: '2', title: 'HR Manager', department_id: '2' },
    { id: '3', title: 'Finance Manager', department_id: '3' }
  ],
  payrollRuns: [
    {
      id: '1',
      payroll_period_start: '2024-01-01',
      payroll_period_end: '2024-01-31', 
      payroll_date: '2024-02-01',
      status: 'approved' as const,
      total_employees: 25,
      total_gross_salary: 1250000,
      total_net_salary: 1050000,
      created_at: '2024-02-01'
    },
    {
      id: '2',
      payroll_period_start: '2024-02-01',
      payroll_period_end: '2024-02-29',
      payroll_date: '2024-03-01', 
      status: 'completed' as const,
      total_employees: 25,
      total_gross_salary: 1250000,
      total_net_salary: 1050000,
      created_at: '2024-03-01'
    }
  ]
};

// Demo API functions that return promises like real API
export const demoAPI = {
  // Auth
  login: (credentials: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            user: demoData.user,
            employee: demoData.employees[0],
            accessToken: 'demo-token-123',
            refreshToken: 'demo-refresh-456'
          }
        });
      }, 500);
    });
  },

  logout: () => Promise.resolve({ data: { success: true } }),

  getProfile: () => {
    return Promise.resolve({
      data: {
        user: demoData.user,
        employee: demoData.employees[0]
      }
    });
  },

  // Employees
  getEmployees: (params: any = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { page = 1, limit = 20, search = '' } = params;
        let filteredEmployees = demoData.employees;
        
        if (search) {
          filteredEmployees = demoData.employees.filter(emp => 
            emp.first_name.toLowerCase().includes(search.toLowerCase()) ||
            emp.last_name.toLowerCase().includes(search.toLowerCase()) ||
            emp.email.toLowerCase().includes(search.toLowerCase())
          );
        }

        resolve({
          data: {
            data: filteredEmployees,
            pagination: {
              page: Number(page),
              limit: Number(limit), 
              total: filteredEmployees.length,
              totalPages: Math.ceil(filteredEmployees.length / Number(limit))
            }
          }
        });
      }, 300);
    });
  },

  getEmployee: (id: string) => {
    return Promise.resolve({
      data: demoData.employees.find(emp => emp.id === id)
    });
  },

  getDepartments: () => {
    return Promise.resolve({
      data: demoData.departments
    });
  },

  getDesignations: () => {
    return Promise.resolve({
      data: demoData.designations
    });
  },

  // Payroll
  getPayrollRuns: (params: any = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            data: demoData.payrollRuns,
            pagination: {
              page: 1,
              limit: 20,
              total: demoData.payrollRuns.length,
              totalPages: 1
            }
          }
        });
      }, 400);
    });
  }
};

// Check if we're in demo mode
export const isDemoMode = () => {
  return process.env.REACT_APP_DEMO_MODE === 'true' || 
         window.location.hostname.includes('github.io');
};
