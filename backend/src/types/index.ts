
export interface User {
  id: string;
  email: string;
  password_hash?: string;
  role: UserRole;
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export type UserRole = 'super_admin' | 'hr_admin' | 'payroll_admin' | 'manager' | 'employee';

export interface Employee {
  id: string;
  user_id?: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: Date;
  joining_date: Date;
  resignation_date?: Date;
  department_id?: string;
  designation_id?: string;
  manager_id?: string;
  employment_type: EmploymentType;
  pan_number?: string;
  aadhaar_number?: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  bank_name?: string;
  address?: any;
  emergency_contact?: any;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern';

export interface Department {
  id: string;
  name: string;
  code: string;
  head_id?: string;
  parent_department_id?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Designation {
  id: string;
  title: string;
  level?: number;
  department_id?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SalaryStructure {
  id: string;
  employee_id: string;
  basic_salary: number;
  hra: number;
  conveyance_allowance: number;
  medical_allowance: number;
  special_allowance: number;
  pf_contribution: number;
  esi_contribution: number;
  professional_tax: number;
  effective_from: Date;
  effective_to?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PayrollRun {
  id: string;
  payroll_period_start: Date;
  payroll_period_end: Date;
  payroll_date: Date;
  status: PayrollStatus;
  total_employees?: number;
  total_gross_salary?: number;
  total_deductions?: number;
  total_net_salary?: number;
  processed_by?: string;
  approved_by?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export type PayrollStatus = 'draft' | 'processing' | 'completed' | 'approved' | 'cancelled';

export interface PayrollItem {
  id: string;
  payroll_run_id: string;
  employee_id: string;
  basic_salary?: number;
  hra?: number;
  conveyance_allowance?: number;
  medical_allowance?: number;
  special_allowance?: number;
  overtime_amount?: number;
  bonus?: number;
  gross_salary?: number;
  pf_deduction?: number;
  esi_deduction?: number;
  professional_tax?: number;
  tds_deduction?: number;
  loan_deduction?: number;
  other_deductions?: number;
  total_deductions?: number;
  net_salary?: number;
  days_present?: number;
  days_absent?: number;
  leave_without_pay?: number;
  overtime_hours?: number;
  created_at: Date;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: Date;
  check_in_time?: string;
  check_out_time?: string;
  total_hours?: number;
  overtime_hours?: number;
  status: AttendanceStatus;
  remarks?: string;
  created_at: Date;
  updated_at: Date;
}

export type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'late' | 'early_departure';

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  max_days_per_year?: number;
  carry_forward_allowed: boolean;
  encashment_allowed: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface LeaveBalance {
  id: string;
  employee_id: string;
  leave_type_id: string;
  year: number;
  allocated_days?: number;
  used_days: number;
  remaining_days?: number;
  carried_forward: number;
  created_at: Date;
  updated_at: Date;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: Date;
  end_date: Date;
  total_days?: number;
  reason?: string;
  status: LeaveStatus;
  applied_by?: string;
  reviewed_by?: string;
  review_comments?: string;
  applied_at: Date;
  reviewed_at?: Date;
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  table_name?: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateEmployeeRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: Date;
  joining_date: Date;
  department_id?: string;
  designation_id?: string;
  manager_id?: string;
  employment_type: EmploymentType;
  pan_number?: string;
  aadhaar_number?: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  bank_name?: string;
  address?: any;
  emergency_contact?: any;
}

export interface CreatePayrollRunRequest {
  payroll_period_start: Date;
  payroll_period_end: Date;
  payroll_date: Date;
  employee_ids?: string[];
}

export interface CreateLeaveRequest {
  leave_type_id: string;
  start_date: Date;
  end_date: Date;
  reason?: string;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
