const dotenv = require('dotenv');
const path = require('path');

// Load .env from backend folder or root folder
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // also check current working dir

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT, 10) || 3306,
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'mediminder_db',

  USE_SQLITE_FALLBACK: process.env.USE_SQLITE_FALLBACK !== 'false',
  SQLITE_DB_PATH: process.env.SQLITE_DB_PATH || path.resolve(__dirname, '../../data/mediminder.json'),

  JWT_SECRET: process.env.JWT_SECRET || 'mediminder_super_secure_jwt_secret_key_2026_default_fallback',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  REMINDER_CRON_SCHEDULE: process.env.REMINDER_CRON_SCHEDULE || '* * * * *',

  SMTP_ENABLED: process.env.SMTP_ENABLED === 'true',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'MediMinder Alerts <no-reply@mediminder.app>'
};
