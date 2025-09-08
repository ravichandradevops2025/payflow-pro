
import { Request, Response } from 'express';
import { db } from '../services/database';
import { PayrollRun, PayrollItem, ApiResponse } from '../types';
import { AuthRequest } from '../middleware/auth';

export class PayrollController {
  async getPayrollRuns(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        year,
        month
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      let whereConditions: string[] = [];
      let queryParams: any[] = [];
      let paramIndex = 1;

      if (status && status !== 'all') {
        whereConditions.push(`status = $${paramIndex}`);
        queryParams.push(status);
        paramIndex++;
      }

      if (year) {
        whereConditions.push(`EXTRACT(YEAR FROM payroll_period_start) = $${paramIndex}`);
        queryParams.push(year);
        paramIndex++;
      }

      if (month) {
        whereConditions.push(`EXTRACT(MONTH FROM payroll_period_start) = $${paramIndex}`);
        queryParams.push(month);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 
        ? 'WHERE ' + whereConditions.join(' AND ')
        : '';

      // Get total count
      const countResult = await db.query(
        `SELECT COUNT(*) as count FROM payroll_runs ${whereClause}`,
        queryParams
      );
      const total = parseInt(countResult.rows[0].count);

      // Get payroll runs
      const query = `
        SELECT 
          pr.*,
          u1.email as processed_by_email,
          u2.email as approved_by_email
        FROM payroll_runs pr
        LEFT JOIN users u1 ON pr.processed_by = u1.id
        LEFT JOIN users u2 ON pr.approved_by = u2.id
        ${whereClause}
        ORDER BY pr.created_at DESC
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
      console.error('Get payroll runs error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getPayrollRun(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          pr.*,
          u1.email as processed_by_email,
          u2.email as approved_by_email
        FROM payroll_runs pr
        LEFT JOIN users u1 ON pr.processed_by = u1.id
        LEFT JOIN users u2 ON pr.approved_by = u2.id
        WHERE pr.id = $1
      `;

      const result = await db.query(query, [id]);
      
      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Payroll run not found'
        });
        return;
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Get payroll run error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async createPayrollRun(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { payroll_period_start, payroll_period_end, payroll_date, employee_ids } = req.body;
      const userId = req.user!.id;

      // Check for overlapping payroll runs
      const overlappingRuns = await db.query(
        `SELECT id FROM payroll_runs 
         WHERE status NOT IN ('cancelled') 
         AND (
           (payroll_period_start <= $1 AND payroll_period_end >= $1) OR
           (payroll_period_start <= $2 AND payroll_period_end >= $2) OR
           (payroll_period_start >= $1 AND payroll_period_end <= $2)
         )`,
        [payroll_period_start, payroll_period_end]
      );

      if (overlappingRuns.rows.length > 0) {
        res.status(409).json({
          success: false,
          error: 'Overlapping payroll period exists'
        });
        return;
      }

      // Create payroll run
      const payrollRun = await db.create<PayrollRun>('payroll_runs', {
        payroll_period_start,
        payroll_period_end,
        payroll_date,
        processed_by: userId,
        status: 'draft'
      });

      res.status(201).json({
        success: true,
        data: payrollRun,
        message: 'Payroll run created successfully'
      });
    } catch (error) {
      console.error('Create payroll run error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async processPayroll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await db.transaction(async (client) => {
        // Get payroll run
        const payrollRunResult = await client.query(
          'SELECT * FROM payroll_runs WHERE id = $1',
          [id]
        );

        if (payrollRunResult.rows.length === 0) {
          throw new Error('Payroll run not found');
        }

        const payrollRun = payrollRunResult.rows[0];

        if (payrollRun.status !== 'draft') {
          throw new Error('Payroll run must be in draft status');
        }

        // Update status to processing
        await client.query(
          'UPDATE payroll_runs SET status = $1 WHERE id = $2',
          ['processing', id]
        );

        // Get active employees with salary structures
        const employeesQuery = `
          SELECT 
            e.id, e.employee_code, e.first_name, e.last_name,
            ss.basic_salary, ss.hra, ss.conveyance_allowance, ss.medical_allowance,
            ss.special_allowance, ss.pf_contribution, ss.esi_contribution, ss.professional_tax
          FROM employees e
          JOIN salary_structures ss ON e.id = ss.employee_id
          WHERE e.is_active = true 
          AND ss.is_active = true
          AND ss.effective_from <= $1
          ORDER BY e.employee_code
        `;

        const employeesResult = await client.query(employeesQuery, [payrollRun.payroll_period_end]);
        const employees = employeesResult.rows;

        if (employees.length === 0) {
          throw new Error('No active employees found with salary structures');
        }

        let totalGrossSalary = 0;
        let totalDeductions = 0;
        let totalNetSalary = 0;

        // Process each employee
        for (const employee of employees) {
          // Get attendance data for the period
          const attendanceResult = await client.query(
            `SELECT 
               COUNT(*) as total_days,
               COUNT(CASE WHEN status = 'present' THEN 1 END) as present_days,
               COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_days,
               COUNT(CASE WHEN status = 'half_day' THEN 1 END) as half_days,
               COALESCE(SUM(overtime_hours), 0) as total_overtime_hours
             FROM attendance_records 
             WHERE employee_id = $1 
             AND date BETWEEN $2 AND $3`,
            [employee.id, payrollRun.payroll_period_start, payrollRun.payroll_period_end]
          );

          const attendance = attendanceResult.rows[0];
          const workingDays = this.getWorkingDays(payrollRun.payroll_period_start, payrollRun.payroll_period_end);
          const presentDays = parseInt(attendance.present_days) + (parseInt(attendance.half_days) * 0.5);
          const absentDays = workingDays - presentDays;

          // Calculate salary components
          const dailySalary = employee.basic_salary / workingDays;
          const actualBasicSalary = dailySalary * presentDays;
          
          const actualHRA = (employee.hra / workingDays) * presentDays;
          const actualConveyance = (employee.conveyance_allowance / workingDays) * presentDays;
          const actualMedical = (employee.medical_allowance / workingDays) * presentDays;
          const actualSpecial = (employee.special_allowance / workingDays) * presentDays;

          // Calculate overtime (1.5x basic hourly rate)
          const hourlyRate = employee.basic_salary / (workingDays * 8);
          const overtimeAmount = parseFloat(attendance.total_overtime_hours) * hourlyRate * 1.5;

          const grossSalary = actualBasicSalary + actualHRA + actualConveyance + actualMedical + actualSpecial + overtimeAmount;

          // Calculate deductions
          const pfDeduction = (actualBasicSalary * 0.12); // 12% of basic salary
          const esiDeduction = grossSalary <= 21000 ? (grossSalary * 0.0075) : 0; // 0.75% if salary <= 21000
          const professionalTax = employee.professional_tax;
          
          // Simple TDS calculation (if annual salary > 250000)
          const annualGross = grossSalary * 12;
          const tdsDeduction = annualGross > 250000 ? (grossSalary * 0.1) : 0;

          const totalDeduction = pfDeduction + esiDeduction + professionalTax + tdsDeduction;
          const netSalary = grossSalary - totalDeduction;

          // Create payroll item
          await client.query(
            `INSERT INTO payroll_items (
              payroll_run_id, employee_id, basic_salary, hra, conveyance_allowance,
              medical_allowance, special_allowance, overtime_amount, gross_salary,
              pf_deduction, esi_deduction, professional_tax, tds_deduction,
              total_deductions, net_salary, days_present, days_absent,
              overtime_hours
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
            [
              id, employee.id, actualBasicSalary, actualHRA, actualConveyance,
              actualMedical, actualSpecial, overtimeAmount, grossSalary,
              pfDeduction, esiDeduction, professionalTax, tdsDeduction,
              totalDeduction, netSalary, presentDays, absentDays,
              attendance.total_overtime_hours
            ]
          );

          totalGrossSalary += grossSalary;
          totalDeductions += totalDeduction;
          totalNetSalary += netSalary;
        }

        // Update payroll run with totals
        await client.query(
          `UPDATE payroll_runs 
           SET status = 'completed', total_employees = $1, total_gross_salary = $2,
               total_deductions = $3, total_net_salary = $4
           WHERE id = $5`,
          [employees.length, totalGrossSalary, totalDeductions, totalNetSalary, id]
        );

        res.json({
          success: true,
          message: 'Payroll processed successfully',
          data: {
            totalEmployees: employees.length,
            totalGrossSalary,
            totalDeductions,
            totalNetSalary
          }
        });
      });
    } catch (error) {
      console.error('Process payroll error:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async approvePayroll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const result = await db.update('payroll_runs', id, {
        status: 'approved',
        approved_by: userId
      });

      if (!result) {
        res.status(404).json({
          success: false,
          error: 'Payroll run not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Payroll approved successfully'
      });
    } catch (error) {
      console.error('Approve payroll error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getPayrollItems(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      const query = `
        SELECT 
          pi.*,
          e.employee_code, e.first_name, e.last_name, e.email,
          d.name as department_name
        FROM payroll_items pi
        JOIN employees e ON pi.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE pi.payroll_run_id = $1
        ORDER BY e.employee_code
        LIMIT $2 OFFSET $3
      `;

      const result = await db.query(query, [id, Number(limit), offset]);

      // Get total count
      const countResult = await db.query(
        'SELECT COUNT(*) as count FROM payroll_items WHERE payroll_run_id = $1',
        [id]
      );
      const total = parseInt(countResult.rows[0].count);

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
      console.error('Get payroll items error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getEmployeePayslips(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const { page = 1, limit = 12, year } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      let whereConditions = ['pi.employee_id = $1'];
      let queryParams: any[] = [employeeId];
      let paramIndex = 2;

      if (year) {
        whereConditions.push(`EXTRACT(YEAR FROM pr.payroll_period_start) = $${paramIndex}`);
        queryParams.push(year);
        paramIndex++;
      }

      const whereClause = whereConditions.join(' AND ');

      const query = `
        SELECT 
          pi.*,
          pr.payroll_period_start, pr.payroll_period_end, pr.payroll_date, pr.status,
          e.employee_code, e.first_name, e.last_name
        FROM payroll_items pi
        JOIN payroll_runs pr ON pi.payroll_run_id = pr.id
        JOIN employees e ON pi.employee_id = e.id
        WHERE ${whereClause}
        ORDER BY pr.payroll_period_start DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      queryParams.push(Number(limit), offset);
      const result = await db.query(query, queryParams);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get employee payslips error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Helper function to calculate working days (excluding weekends)
  private getWorkingDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let workingDays = 0;

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude Sunday (0) and Saturday (6)
        workingDays++;
      }
    }

    return workingDays;
  }
}

export const payrollController = new PayrollController();
