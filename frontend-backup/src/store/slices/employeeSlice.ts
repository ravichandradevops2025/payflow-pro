
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { employeeAPI } from '../../services/api';

export interface Employee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  joining_date: string;
  department_id?: string;
  designation_id?: string;
  employment_type: string;
  is_active: boolean;
  department_name?: string;
  designation_title?: string;
  manager_first_name?: string;
  manager_last_name?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Designation {
  id: string;
  title: string;
  level?: number;
}

export interface SalaryStructure {
  id: string;
  employee_id: string;
  basic_salary: number;
  hra: number;
  conveyance_allowance: number;
  medical_allowance: number;
  special_allowance: number;
  effective_from: string;
  is_active: boolean;
}

interface EmployeeState {
  employees: Employee[];
  selectedEmployee: Employee | null;
  departments: Department[];
  designations: Designation[];
  salaryStructures: SalaryStructure[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: EmployeeState = {
  employees: [],
  selectedEmployee: null,
  departments: [],
  designations: [],
  salaryStructures: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const fetchEmployees = createAsyncThunk(
  'employee/fetchEmployees',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getEmployees(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch employees');
    }
  }
);

export const fetchEmployee = createAsyncThunk(
  'employee/fetchEmployee',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getEmployee(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch employee');
    }
  }
);

export const createEmployee = createAsyncThunk(
  'employee/createEmployee',
  async (employeeData: any, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.createEmployee(employeeData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create employee');
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employee/updateEmployee',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.updateEmployee(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update employee');
    }
  }
);

export const fetchDepartments = createAsyncThunk(
  'employee/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getDepartments();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch departments');
    }
  }
);

export const fetchDesignations = createAsyncThunk(
  'employee/fetchDesignations',
  async (departmentId?: string, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getDesignations(departmentId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch designations');
    }
  }
);

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Employees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Employee
      .addCase(fetchEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEmployee = action.payload;
      })
      .addCase(fetchEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create Employee
      .addCase(createEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees.unshift(action.payload.employee);
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Departments
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.departments = action.payload;
      })
      
      // Fetch Designations
      .addCase(fetchDesignations.fulfilled, (state, action) => {
        state.designations = action.payload;
      });
  },
});

export const { clearError, clearSelectedEmployee } = employeeSlice.actions;
export default employeeSlice.reducer;
