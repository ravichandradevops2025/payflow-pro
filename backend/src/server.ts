
import app from './app';
import { connectDB } from './config/database';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

async function startServer() {
 try {
   // Connect to databases
   await connectDB();
   
   // Start server
   app.listen(PORT, () => {
     console.log(`Ì∫Ä PayFlow Pro API server running on http://${HOST}:${PORT}`);
     console.log(`Ì≥ö API Documentation: http://${HOST}:${PORT}/api/v1`);
     console.log(`Ìø• Health Check: http://${HOST}:${PORT}/health`);
     console.log(`Ìºç Environment: ${process.env.NODE_ENV || 'development'}`);
   });
 } catch (error) {
   console.error('‚ùå Failed to start server:', error);
   process.exit(1);
 }
}

startServer();
