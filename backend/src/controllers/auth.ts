
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../services/database';
import { redisClient } from '../config/database';
import { User, JWTPayload, ApiResponse } from '../types';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await db.findOne<User>('users', { email, is_active: true });
      
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash!);
      
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
        return;
      }

      // Generate tokens
      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const accessToken = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
      );

      const refreshToken = jwt.sign(
        payload,
        process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret',
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
      );

      // Store refresh token in Redis
      await redisClient.setEx(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, refreshToken);

      // Update last login
      await db.update('users', user.id, { last_login: new Date() });

      // Get employee details if exists
      let employeeDetails = null;
      if (user.role === 'employee' || user.role === 'manager') {
        employeeDetails = await db.findOne('employees', { user_id: user.id });
      }

      const response: ApiResponse = {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role
          },
          employee: employeeDetails,
          accessToken,
          refreshToken
        },
        message: 'Login successful'
      };

      res.json(response);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          error: 'Refresh token required'
        });
        return;
      }

      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret'
      ) as JWTPayload;

      // Check if refresh token exists in Redis
      const storedToken = await redisClient.get(`refresh_token:${decoded.userId}`);
      
      if (!storedToken || storedToken !== refreshToken) {
        res.status(401).json({
          success: false,
          error: 'Invalid refresh token'
        });
        return;
      }

      // Verify user still exists and is active
      const user = await db.findById<User>('users', decoded.userId);
      
      if (!user || !user.is_active) {
        res.status(401).json({
          success: false,
          error: 'User not found or inactive'
        });
        return;
      }

      // Generate new access token
      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const newAccessToken = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
      );

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken
        }
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      // Remove refresh token from Redis
      await redisClient.del(`refresh_token:${userId}`);

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const user = await db.findById<User>('users', userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      // Get employee details if exists
      let employeeDetails = null;
      if (user.role === 'employee' || user.role === 'manager') {
        employeeDetails = await db.query(
          `SELECT e.*, d.name as department_name, des.title as designation_title,
                  m.first_name as manager_first_name, m.last_name as manager_last_name
           FROM employees e
           LEFT JOIN departments d ON e.department_id = d.id
           LEFT JOIN designations des ON e.designation_id = des.id
           LEFT JOIN employees m ON e.manager_id = m.id
           WHERE e.user_id = $1`,
          [userId]
        );
        employeeDetails = employeeDetails.rows[0] || null;
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            last_login: user.last_login,
            created_at: user.created_at
          },
          employee: employeeDetails
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.id;

      // Get current user
      const user = await db.findById<User>('users', userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash!);
      
      if (!isValidPassword) {
        res.status(400).json({
          success: false,
          error: 'Current password is incorrect'
        });
        return;
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await db.update('users', userId, { password_hash: hashedPassword });

      // Invalidate all refresh tokens
      await redisClient.del(`refresh_token:${userId}`);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

export const authController = new AuthController();
