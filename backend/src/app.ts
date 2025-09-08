
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import routes from './routes';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Routes
app.use('/', routes);
// Global error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
 console.error('Global error handler:', error);
 
 res.status(500).json({
   success: false,
   error: 'Internal server error',
   message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
 });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
 res.status(404).json({
   success: false,
   error: 'Endpoint not found'
 });
});

export default app;
