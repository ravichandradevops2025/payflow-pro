
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
      return;
    }
    
    next();
  };
};

// Validation Schemas
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

export const createEmployeeSchema = Joi.object({
  first_name: Joi.string().min(2).max(100).required(),
  last_name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  date_of_birth: Joi.date().max('now').optional(),
  joining_date: Joi.date().required(),
  department_id: Joi.string().uuid().optional(),
  designation_id: Joi.string().uuid().optional(),
  manager_id: Joi.string().uuid().optional(),
  employment_type: Joi.string().valid('full_time', 'part_time', 'contract', 'intern').required(),
  pan_number: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional(),
  aadhaar_number: Joi.string().pattern(/^[0-9]{12}$/).optional(),
  bank_account_number: Joi.string().min(9).max(18).optional(),
  bank_ifsc: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).optional(),
  bank_name: Joi.string().max(100).optional(),
  address: Joi.object().optional(),
  emergency_contact: Joi.object().optional()
});

export const updateEmployeeSchema = Joi.object({
  first_name: Joi.string().min(2).max(100).optional(),
  last_name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  date_of_birth: Joi.date().max('now').optional(),
  department_id: Joi.string().uuid().optional(),
  designation_id: Joi.string().uuid().optional(),
  manager_id: Joi.string().uuid().optional(),
  employment_type: Joi.string().valid('full_time', 'part_time', 'contract', 'intern').optional(),
  bank_account_number: Joi.string().min(9).max(18).optional(),
  bank_ifsc: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).optional(),
  bank_name: Joi.string().max(100).optional(),
  address: Joi.object().optional(),
  emergency_contact: Joi.object().optional()
});

export const createSalaryStructureSchema = Joi.object({
  basic_salary: Joi.number().positive().required(),
  hra: Joi.number().min(0).default(0),
  conveyance_allowance: Joi.number().min(0).default(0),
  medical_allowance: Joi.number().min(0).default(0),
  special_allowance: Joi.number().min(0).default(0),
  pf_contribution: Joi.number().min(0).default(0),
  esi_contribution: Joi.number().min(0).default(0),
  professional_tax: Joi.number().min(0).default(0),
  effective_from: Joi.date().required()
});

export const createPayrollRunSchema = Joi.object({
  payroll_period_start: Joi.date().required(),
  payroll_period_end: Joi.date().greater(Joi.ref('payroll_period_start')).required(),
  payroll_date: Joi.date().required(),
  employee_ids: Joi.array().items(Joi.string().uuid()).optional()
});

export const createLeaveRequestSchema = Joi.object({
  leave_type_id: Joi.string().uuid().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().greater(Joi.ref('start_date')).required(),
  reason: Joi.string().max(500).optional()
});

export const attendanceRecordSchema = Joi.object({
  employee_id: Joi.string().uuid().required(),
  date: Joi.date().required(),
  check_in_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  check_out_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  status: Joi.string().valid('present', 'absent', 'half_day', 'late', 'early_departure').required(),
  remarks: Joi.string().max(255).optional()
});
