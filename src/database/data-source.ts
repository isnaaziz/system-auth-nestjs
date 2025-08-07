import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserSession } from '../entities/user-session.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'system_auth',
  schema: process.env.DB_SCHEMA || 'public',
  synchronize: false, // Always set to false in production
  logging: process.env.NODE_ENV === 'development',
  entities: [User, UserSession],
  migrations: [__dirname + '/migrations/*.ts'],
  subscribers: [],
  migrationsRun: false,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default AppDataSource;
