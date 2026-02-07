// Backend environment configuration
import dotenv from 'dotenv';

dotenv.config();

/**
 * Application configuration loaded from environment variables
 * with sensible defaults for local development
 */
export const config = {
  // Server settings
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // MongoDB connection
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/collab-code-editor',

  // JWT authentication
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // CORS settings
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Yjs WebSocket provider settings
  yjsPort: parseInt(process.env.YJS_PORT || '1234', 10),
} as const;

export type Config = typeof config;
