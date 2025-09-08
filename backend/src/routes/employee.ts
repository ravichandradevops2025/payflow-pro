
import { Router } from 'express';
import { employeeController } from '../controllers/employee';
import { authenticate, isHRAdmin, canAccessEmployee } from '../middleware/auth';
import { validate, createEmployeeSchema, updateEmployeeSchema, createSalaryStructureSchema } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Public employee routes (for dropdowns, etc.)
router.get('/departments', employeeController.getDepartments);
router.get('/designations', employeeController.getDesignations);

// Employee management routes (HR Admin only)
router.get('/', isHRAdmin, employeeController.getEmployees);
router.post('/', isHRAdmin, validate(createEmployeeSchema), employeeController.createEmployee);

// Individual employee routes
router.get('/:id', canAccessEmployee, employeeController.getEmployee);
router.put('/:id', isHRAdmin, validate(updateEmployeeSchema), employeeController.updateEmployee);
router.patch('/:id/deactivate', isHRAdmin, employeeController.deactivateEmployee);
router.patch('/:id/activate', isHRAdmin, employeeController.activateEmployee);

// Salary structure routes
router.get('/:id/salary-structure', canAccessEmployee, employeeController.getEmployeeSalaryStructure);
router.post('/:id/salary-structure', isHRAdmin, validate(createSalaryStructureSchema), employeeController.createSalaryStructure);

export default router;
