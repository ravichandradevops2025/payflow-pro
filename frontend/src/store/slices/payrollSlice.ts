
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { payrollAPI } from '../../services/api';

export interface PayrollRun {
  id: string;
  payroll_period_start: string;
  payroll_period_end: string;
  payroll_date: string;
  status: 'draft' | 'processing' | 'completed' | 'approved' | 'cancelled';
  total_employees?: number;
  total_gross_salary?: number;
  total_deductions?: number;
  total_net_salary?: number;
  processed_by_email?: string;
  approved_by_email?: string;
  created_at: string;
}

export interface PayrollItem {
  id: string;
  payroll_run_id: string;
  employee_id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  department_name?: string;
  basic_salary?: number;
  hra?: number;
  gross_salary?: number;
  total_deductions?: number;
  net_salary?: number;
  days_present?: number;
  days_absent?: number;
  overtime_hours?: number;
}

export interface Payslip {
  id: string;
  payroll_run_id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  payroll_period_start: string;
  payroll_period_end: string;
  payroll_date: string;
  basic_salary?: number;
  hra?: number;
  gross_salary?: number;
  total_deductions?: number;
  net_salary?: number;
  status: string;
}

interface PayrollState {
  payrollRuns: PayrollRun[];
  selectedPayrollRun: PayrollRun | null;
  payrollItems: PayrollItem[];
  payslips: Payslip[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: PayrollState = {
  payrollRuns: [],
  selectedPayrollRun: null,
  payrollItems: [],
  payslips: [],
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
export const fetchPayrollRuns = createAsyncThunk(
  'payroll/fetchPayrollRuns',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await payrollAPI.getPayrollRuns(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch payroll runs');
    }
  }
);

export const fetchPayrollRun = createAsyncThunk(
  'payroll/fetchPayrollRun',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await payrollAPI.getPayrollRun(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch payroll run');
    }
  }
);

export const createPayrollRun = createAsyncThunk(
  'payroll/createPayrollRun',
  async (payrollData: any, { rejectWithValue }) => {
    try {
      const response = await payrollAPI.createPayrollRun(payrollData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create payroll run');
    }
  }
);

export const processPayroll = createAsyncThunk(
  'payroll/processPayroll',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await payrollAPI.processPayroll(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to process payroll');
    }
  }
);

export const fetchPayrollItems = createAsyncThunk(
  'payroll/fetchPayrollItems',
  async ({ id, params }: { id: string; params?: any }, { rejectWithValue }) => {
    try {
      const response = await payrollAPI.getPayrollItems(id, params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch payroll items');
    }
  }
);

export const fetchEmployeePayslips = createAsyncThunk(
  'payroll/fetchEmployeePayslips',
  async ({ employeeId, params }: { employeeId: string; params?: any }, { rejectWithValue }) => {
    try {
      const response = await payrollAPI.getEmployeePayslips(employeeId, params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch payslips');
    }
  }
);

const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedPayrollRun: (state) => {
      state.selectedPayrollRun = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Payroll Runs
      .addCase(fetchPayrollRuns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayrollRuns.fulfilled, (state, action) => {
        state.loading = false;
        state.payrollRuns = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPayrollRuns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Payroll Run
      .addCase(fetchPayrollRun.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayrollRun.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPayrollRun = action.payload;
      })
      .addCase(fetchPayrollRun.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create Payroll Run
      .addCase(createPayrollRun.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayrollRun.fulfilled, (state, action) => {
        state.loading = false;
        state.payrollRuns.unshift(action.payload);
      })
      .addCase(createPayrollRun.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Payroll Items
      .addCase(fetchPayrollItems.fulfilled, (state, action) => {
        state.payrollItems = action.payload.data;
      })
      
      // Fetch Employee Payslips
      .addCase(fetchEmployeePayslips.fulfilled, (state, action) => {
        state.payslips = action.payload;
      });
  },
});

export const { clearError, clearSelectedPayrollRun } = payrollSlice.actions;
export default payrollSlice.reducer;
