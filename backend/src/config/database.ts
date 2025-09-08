
import { Pool, PoolConfig } from 'pg';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL Configuration
const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'payflow_pro',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(poolConfig);

// Redis Configuration
export const redisClient = createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
});

// Database connection handlers
export const connectDB = async (): Promise<void> => {
  try {
    // Test PostgreSQL connection
    const client = await pool.connect();
    console.log('âœ… PostgreSQL connected successfully');
    client.release();

    // Connect Redis
    await redisClient.connect();
    console.log('âœ… Redis connected successfully');
  } catch (error) {
    console.error('âŒ Database connection failed:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('í´„ Closing database connections...');
  await pool.end();
  await redisClient.quit();
  process.exit(0);
});
