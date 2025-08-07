import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UserSession } from '../entities/user-session.entity';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: String(process.env.DB_PASSWORD || ''),
    database: process.env.DB_DATABASE || 'dbtesting',
    schema: process.env.DB_SCHEMA || 'system-auth',
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    entities: [User, UserSession],
    autoLoadEntities: true,
    retryAttempts: 3,
    retryDelay: 3000,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  }),
);
