import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000'),
  environment: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  globalPrefix: process.env.GLOBAL_PREFIX || 'api',
}));
