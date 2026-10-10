const app = require('./app');
const config = require('./config/env');
const db = require('./config/db');
const { initScheduler } = require('./jobs/reminderScheduler');

async function startServer() {
  try {
    // 1. Initialize Database connection & auto-migrations
    await db.initDb();

    // 2. Start background reminder cron job
    initScheduler();

    // 3. Start Express server
    const server = app.listen(config.PORT, () => {
      console.log(`====================================================`);
      console.log(`💊 MediMinder Backend Server running on port ${config.PORT}`);
      console.log(`🌐 Base URL: http://localhost:${config.PORT}`);
      console.log(`🩺 Health check: http://localhost:${config.PORT}/api/health`);
      console.log(`⚙️  Environment: ${config.NODE_ENV}`);
      console.log(`====================================================`);
    });

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Process terminated.');
      });
    });

  } catch (error) {
    console.error('Fatal error starting MediMinder server:', error);
    process.exit(1);
  }
}

startServer();
