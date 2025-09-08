
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../services/database';
import { Employee, User, ApiResponse, CreateEmployeeRequest } from '../types';
import { AuthRequest } from '../middleware/auth';

export class EmployeeController {
  async getEmployees(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        department_id,
        designation_id,
        employment_type,
        is_active = 'true'
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      let whereConditions: string[] = [];
      let queryParams: any[] = [];
      let paramIndex = 1;

      // Build where conditions
      if (is_active !== 'all') {
        whereConditions.push(`e.is_active = $${paramIndex}`);
        queryParams.push(is_active === 'true');
        paramIndex++;
      }

      if (department_id) {
        whereConditions.push(`e.department_id = $${paramIndex}`);
        queryParams.push(department_id);
        paramIndex++;
      }

      if (designation_id) {
        whereConditions.push(`e.designation_id = $${paramIndex}`);
        queryParams.push(designation_id);
        paramIndex++;
      }

      if (employment_type) {
        whereConditions.push(`e.employment_type = $${paramIndex}`);
        queryParams.push(employment_type);
        paramIndex++;
      }

      if (search) {
        whereConditions.push(`(
          e.first_name ILIKE $${paramIndex} OR 
          e.last_name ILIKE $${paramIndex} OR 
          e.email ILIKE $${paramIndex} OR 
          e.employee_code ILIKE $${paramIndex}
        )`);
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 
        ? 'WHERE ' + whereConditions.join(' AND ')
        : '';

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as count
        FROM employees e
        ${whereClause}
      `;
      const countResult = await db.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);

      // Get employees with related data
      const query = `
        SELECT 
          e.*,
          d.name as department_name,
          des.title as designation_title,
          m.first_name as manager_first_name,
          m.last_name as manager_last_name,
          u.email as user_email,
          u.role as user_role
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN designations des ON e.designation_id = des.id
        LEFT JOIN employees m ON e.manager_id = m.id
        LEFT JOIN users u ON e.user_id = u.id
        ${whereClause}
        ORDER BY e.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      queryParams.push(Number(limit), offset);
      const result = await db.query(query, queryParams);

      const response: ApiResponse = {
        success: true,
        data: result.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Get employees error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getEmployee(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          e.*,
          d.name as department_name,
          des.title as designation_title,
          m.first_name as manager_first_name,
          m.last_name as manager_last_name,
          u.email as user_email,
          u.role as user_role,
          u.is_active as user_active
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN designations des ON e.designation_id = des.id
        LEFT JOIN employees m ON e.manager_id = m.id
        LEFT JOIN users u ON e.user_id = u.id
        WHERE e.id = $1
      `;

      const result = await db.query(query, [id]);
      
      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Employee not found'
        });
        return;
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Get employee error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async createEmployee(req: AuthRequest, res: Response): Promise<void> {
    try {
      const employeeData: CreateEmployeeRequest = req.body;

      await db.transaction(async (client) => {
        // Generate employee code
        const codeResult = await client.query(
          'SELECT COUNT(*) as count FROM employees'
        );
        const employeeCount = parseInt(codeResult.rows[0].count);
        const employeeCode = `EMP${String(employeeCount + 1).padStart(4, '0')}`;

        // Check if email already exists
        const existingEmployee = await client.query(
          'SELECT id FROM employees WHERE email = $1',
          [employeeData.email]
        );

        if (existingEmployee.rows.length > 0) {
          throw new Error('Email already exists');
        }

        // Create employee record
        const employee = await client.query(
          `INSERT INTO employees (
            employee_code, first_name, last_name, email, phone, date_of_birth,
            joining_date, department_id, designation_id, manager_id, employment_type,
            pan_number, aadhaar_number, bank_account_number, bank_ifsc, bank_name,
            address, emergency_contact
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          RETURNING *`,
          [
            employeeCode,
            employeeData.first_name,
            employeeData.last_name,
            employeeData.email,
            employeeData.phone,
            employeeData.date_of_birth,
            employeeData.joining_date,
            employeeData.department_id,
            employeeData.designation_id,
            employeeData.manager_id,
            employeeData.employment_type,
            employeeData.pan_number,
            employeeData.aadhaar_number,
            employeeData.bank_account_number,
            employeeData.bank_ifsc,
            employeeData.bank_name,
            employeeData.address ? JSON.stringify(employeeData.address) : null,
            employeeData.emergency_contact ? JSON.stringify(employeeData.emergency_contact) : null
          ]
        );

        // Create user account for employee
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
        const defaultPassword = 'Password123!'; // Employee should change on first login
        const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

        const user = await client.query(
          `INSERT INTO users (email, password_hash, role)
           VALUES ($1, $2, $3) RETURNING *`,
          [employeeData.email, hashedPassword, 'employee']
        );

        // Link user to employee
        await client.query(
          'UPDATE employees SET user_id = $1 WHERE id = $2',
          [user.rows[0].id, employee.rows[0].id]
        );

        res.status(201).json({
          success: true,
          data: {
            employee: employee.rows[0],
            user: {
              id: user.rows[0].id,
              email: user.rows[0].email,
              role: user.rows[0].role
            },
            defaultPassword // In production, send this via email
          },
          message: 'Employee created successfully'
        });
      });
    } catch (error) {
      console.error('Create employee error:', error);
      
      if (error instanceof Error && error.message === 'Email already exists') {
        res.status(409).json({
          success: false,
          error: 'Email already exists'
        });
        return;
      }
res.status(500).json({
       success: false,
       error: 'Internal server error'
     });
   }
 }

 async updateEmployee(req: AuthRequest, res: Response): Promise<void> {
   try {
     const { id } = req.params;
     const updateData = req.body;

     // Check if employee exists
     const existingEmployee = await db.findById<Employee>('employees', id);
     
     if (!existingEmployee) {
       res.status(404).json({
         success: false,
         error: 'Employee not found'
       });
       return;
     }

     // Prepare update data
     const fieldsToUpdate: Record<string, any> = {};
     
     const allowedFields = [
       'first_name', 'last_name', 'phone', 'date_of_birth',
       'department_id', 'designation_id', 'manager_id', 'employment_type',
       'bank_account_number', 'bank_ifsc', 'bank_name', 'address', 'emergency_contact'
     ];

     for (const field of allowedFields) {
       if (updateData[field] !== undefined) {
         if (field === 'address' || field === 'emergency_contact') {
           fieldsToUpdate[field] = JSON.stringify(updateData[field]);
         } else {
           fieldsToUpdate[field] = updateData[field];
         }
       }
     }

     if (Object.keys(fieldsToUpdate).length === 0) {
       res.status(400).json({
         success: false,
         error: 'No valid fields to update'
       });
       return;
     }

     // Update employee
     const updatedEmployee = await db.update('employees', id, fieldsToUpdate);

     res.json({
       success: true,
       data: updatedEmployee,
       message: 'Employee updated successfully'
     });
   } catch (error) {
     console.error('Update employee error:', error);
     res.status(500).json({
       success: false,
       error: 'Internal server error'
     });
   }
 }

 async deactivateEmployee(req: AuthRequest, res: Response): Promise<void> {
   try {
     const { id } = req.params;
     const { resignation_date, reason } = req.body;

     await db.transaction(async (client) => {
       // Update employee status
       await client.query(
         `UPDATE employees 
          SET is_active = false, resignation_date = $1 
          WHERE id = $2`,
         [resignation_date || new Date(), id]
       );

       // Deactivate user account
       await client.query(
         `UPDATE users 
          SET is_active = false 
          WHERE id = (SELECT user_id FROM employees WHERE id = $1)`,
         [id]
       );

       res.json({
         success: true,
         message: 'Employee deactivated successfully'
       });
     });
   } catch (error) {
     console.error('Deactivate employee error:', error);
     res.status(500).json({
       success: false,
       error: 'Internal server error'
     });
   }
 }

 async activateEmployee(req: AuthRequest, res: Response): Promise<void> {
   try {
     const { id } = req.params;

     await db.transaction(async (client) => {
       // Update employee status
       await client.query(
         `UPDATE employees 
          SET is_active = true, resignation_date = NULL 
          WHERE id = $1`,
         [id]
       );

       // Activate user account
       await client.query(
         `UPDATE users 
          SET is_active = true 
          WHERE id = (SELECT user_id FROM employees WHERE id = $1)`,
         [id]
       );

       res.json({
         success: true,
         message: 'Employee activated successfully'
       });
     });
   } catch (error) {
     console.error('Activate employee error:', error);
     res.status(500).json({
       success: false,
       error: 'Internal server error'
     });
   }
 }

 async getEmployeeSalaryStructure(req: AuthRequest, res: Response): Promise<void> {
   try {
     const { id } = req.params;

     const query = `
       SELECT ss.*, e.first_name, e.last_name, e.employee_code
       FROM salary_structures ss
       JOIN employees e ON ss.employee_id = e.id
       WHERE ss.employee_id = $1 AND ss.is_active = true
       ORDER BY ss.effective_from DESC
     `;

     const result = await db.query(query, [id]);

     res.json({
       success: true,
       data: result.rows
     });
   } catch (error) {
     console.error('Get salary structure error:', error);
     res.status(500).json({
       success: false,
       error: 'Internal server error'
     });
   }
 }

 async createSalaryStructure(req: AuthRequest, res: Response): Promise<void> {
   try {
     const { id } = req.params;
     const salaryData = req.body;

     await db.transaction(async (client) => {
       // Deactivate existing salary structures
       await client.query(
         'UPDATE salary_structures SET is_active = false WHERE employee_id = $1',
         [id]
       );

       // Create new salary structure
       const salaryStructure = await client.query(
         `INSERT INTO salary_structures (
           employee_id, basic_salary, hra, conveyance_allowance, medical_allowance,
           special_allowance, pf_contribution, esi_contribution, professional_tax,
           effective_from
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
         [
           id,
           salaryData.basic_salary,
           salaryData.hra || 0,
           salaryData.conveyance_allowance || 0,
           salaryData.medical_allowance || 0,
           salaryData.special_allowance || 0,
           salaryData.pf_contribution || 0,
           salaryData.esi_contribution || 0,
           salaryData.professional_tax || 0,
           salaryData.effective_from
         ]
       );

       res.status(201).json({
         success: true,
         data: salaryStructure.rows[0],
         message: 'Salary structure created successfully'
       });
     });
   } catch (error) {
     console.error('Create salary structure error:', error);
     res.status(500).json({
       success: false,
       error: 'Internal server error'
     });
   }
 }

 // Get departments for dropdown
 async getDepartments(req: Request, res: Response): Promise<void> {
   try {
     const result = await db.query(
       'SELECT id, name, code FROM departments WHERE is_active = true ORDER BY name'
     );

     res.json({
       success: true,
       data: result.rows
     });
   } catch (error) {
     console.error('Get departments error:', error);
     res.status(500).json({
       success: false,
       error: 'Internal server error'
     });
   }
 }

 // Get designations for dropdown
 async getDesignations(req: Request, res: Response): Promise<void> {
   try {
     const { department_id } = req.query;
     
     let query = 'SELECT id, title, level FROM designations WHERE is_active = true';
     const params: any[] = [];
     
     if (department_id) {
       query += ' AND department_id = $1';
       params.push(department_id);
     }
     
     query += ' ORDER BY title';

     const result = await db.query(query, params);

     res.json({
       success: true,
       data: result.rows
     });
   } catch (error) {
     console.error('Get designations error:', error);
     res.status(500).json({
       success: false,
       error: 'Internal server error'
     });
   }
 }
}

export const employeeController = new EmployeeController();
