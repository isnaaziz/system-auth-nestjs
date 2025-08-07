import { registerAs } from '@nestjs/config';

export default registerAs('session', () => ({
  refreshTokenExpiresIn: process.env.SESSION_REFRESH_TOKEN_EXPIRES_IN || '7d',
  maxActiveSessions: parseInt(process.env.SESSION_MAX_ACTIVE_SESSIONS || '5'),
  cleanupInterval: process.env.SESSION_CLEANUP_INTERVAL || '1h',
}));
