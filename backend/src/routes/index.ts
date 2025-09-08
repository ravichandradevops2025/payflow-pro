
import { Router } from 'express';
import authRoutes from './auth';
import employeeRoutes from './employee';
import payrollRoutes from './payroll';

const router = Router();

// API version prefix
const API_VERSION = process.env.API_VERSION || 'v1';

router.use(`/api/${API_VERSION}/auth`, authRoutes);
router.use(`/api/${API_VERSION}/employees`, employeeRoutes);
router.use(`/api/${API_VERSION}/payroll`, payrollRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'PayFlow Pro API is running',
    timestamp: new Date().toISOString(),
    version: API_VERSION
  });
});

export default router;
