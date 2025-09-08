
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { JWTPayload, UserRole } from '../types';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Access token required'
      });
      return;
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    ) as JWTPayload;

    // Verify user exists and is active
    const userResult = await pool.query(
      'SELECT id, email, role, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
      res.status(401).json({
        success: false,
        error: 'Invalid or inactive user'
      });
      return;
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid access token'
    });
  }
};

export const authorize = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
     res.status(403).json({
       success: false,
       error: 'Insufficient permissions'
     });
     return;
   }

   next();
 };
};

// Role-based permission checks
export const isSuperAdmin = authorize(['super_admin']);
export const isHRAdmin = authorize(['super_admin', 'hr_admin']);
export const isPayrollAdmin = authorize(['super_admin', 'hr_admin', 'payroll_admin']);
export const isManager = authorize(['super_admin', 'hr_admin', 'payroll_admin', 'manager']);
export const isEmployee = authorize(['super_admin', 'hr_admin', 'payroll_admin', 'manager', 'employee']);

// Check if user can access employee data
export const canAccessEmployee = async (
 req: AuthRequest,
 res: Response,
 next: NextFunction
): Promise<void> => {
 try {
   const { employeeId } = req.params;
   const user = req.user!;

   // Super admin and HR admin can access all employees
   if (['super_admin', 'hr_admin'].includes(user.role)) {
     next();
     return;
   }

   // Employees can only access their own data
   if (user.role === 'employee') {
     const employeeResult = await pool.query(
       'SELECT id FROM employees WHERE user_id = $1',
       [user.id]
     );

     if (employeeResult.rows.length === 0 || employeeResult.rows[0].id !== employeeId) {
       res.status(403).json({
         success: false,
         error: 'Can only access your own data'
       });
       return;
     }
   }

   // Managers can access their team members
   if (user.role === 'manager') {
     const managerResult = await pool.query(
       'SELECT id FROM employees WHERE user_id = $1',
       [user.id]
     );

     if (managerResult.rows.length === 0) {
       res.status(403).json({
         success: false,
         error: 'Manager profile not found'
       });
       return;
     }

     const managerId = managerResult.rows[0].id;
     const teamMemberResult = await pool.query(
       'SELECT id FROM employees WHERE (id = $1 AND manager_id = $2) OR id = $2',
       [employeeId, managerId]
     );

     if (teamMemberResult.rows.length === 0) {
       res.status(403).json({
         success: false,
         error: 'Can only access your team members data'
       });
       return;
     }
   }

   next();
 } catch (error) {
   console.error('Access control error:', error);
   res.status(500).json({
     success: false,
     error: 'Access control check failed'
   });
 }
};
