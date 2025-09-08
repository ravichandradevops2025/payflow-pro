
import { Router } from 'express';
import { authController } from '../controllers/auth';
import { authenticate } from '../middleware/auth';
import { validate, loginSchema } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// Public routes
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getProfile);
router.patch('/change-password', 
  authenticate,
  validate(Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required()
  })),
  authController.changePassword
);

export default router;
