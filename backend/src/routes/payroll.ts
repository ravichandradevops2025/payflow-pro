
import { Router } from 'express';
import { payrollController } from '../controllers/payroll';
import { authenticate, isPayrollAdmin, canAccessEmployee } from '../middleware/auth';
import { validate, createPayrollRunSchema } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Payroll run management (Payroll Admin only)
router.get('/runs', isPayrollAdmin, payrollController.getPayrollRuns);
router.post('/runs', isPayrollAdmin, validate(createPayrollRunSchema), payrollController.createPayrollRun);
router.get('/runs/:id', isPayrollAdmin, payrollController.getPayrollRun);
router.post('/runs/:id/process', isPayrollAdmin, payrollController.processPayroll);
router.post('/runs/:id/approve', isPayrollAdmin, payrollController.approvePayroll);

// Payroll items
router.get('/runs/:id/items', isPayrollAdmin, payrollController.getPayrollItems);

// Employee payslips (employees can access their own)
router.get('/employees/:employeeId/payslips', canAccessEmployee, payrollController.getEmployeePayslips);

export default router;
