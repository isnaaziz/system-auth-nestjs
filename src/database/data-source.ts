import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserSession } from '../entities/user-session.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'system_auth',
  synchronize: false, // Always set to false in production
  logging: process.env.NODE_ENV === 'development',
  entities: [User, UserSession],
  migrations: [__dirname + '/migrations/*.ts'],
  subscribers: [],
  migrationsRun: false,
  charset: 'utf8mb4',
  timezone: 'Z',
});

export default AppDataSource;
