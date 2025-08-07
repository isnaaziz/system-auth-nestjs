import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserSession } from '../entities/user-session.entity';
import { CreateSystemAuthSchema1691234567889 } from './migrations/1691234567889-CreateSystemAuthSchema';
import { CreateUsersTable1691234567890 } from './migrations/1691234567890-CreateUsersTable';
import { CreateUserSessionsTable1691234567891 } from './migrations/1691234567891-CreateUserSessionsTable';
import { CreateAdminUserSeeder } from './seeders/create-admin-user.seeder';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: String(process.env.DB_PASSWORD || ''),
  database: process.env.DB_DATABASE || 'system_auth',
  schema: process.env.DB_SCHEMA || 'public',
  synchronize: false,
  logging: true,
  entities: [User, UserSession],
  migrations: [
    CreateSystemAuthSchema1691234567889,
    CreateUsersTable1691234567890,
    CreateUserSessionsTable1691234567891,
  ],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function runMigrations() {
  let dataSource: DataSource | null = null;

  try {
    console.log('Initializing database connection...');
    console.log(`Connecting to: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`);
    console.log(`Schema: ${process.env.DB_SCHEMA}`);

    dataSource = AppDataSource;
    await dataSource.initialize();

    console.log('✅ Database connection established successfully!');

    console.log('Running migrations...');
    await dataSource.runMigrations();
    console.log('✅ Migrations completed successfully!');

    console.log('Running seeders...');
    const seeder = new CreateAdminUserSeeder();
    await seeder.run(dataSource);
    console.log('✅ Seeders completed successfully!');

    console.log('🎉 Database setup completed successfully!');
    console.log(`Database: ${dataSource.options.database}`);
    console.log(`Schema: ${process.env.DB_SCHEMA || 'public'}`);

  } catch (error) {
    console.error('❌ Error during database setup:', error);

    // Check if it's a connection error
    if (error.message?.includes('SASL') || error.message?.includes('password')) {
      console.error('🔑 Authentication failed. Please check:');
      console.error('   - DB_USERNAME is correct');
      console.error('   - DB_PASSWORD is correct');
      console.error('   - PostgreSQL server is running');
      console.error('   - Database exists');
    }

    throw error;
  } finally {
    if (dataSource && dataSource.isInitialized) {
      try {
        await dataSource.destroy();
        console.log('✅ Database connection closed.');
      } catch (destroyError) {
        console.error('⚠️  Error closing database connection:', destroyError);
      }
    }
  }
}

runMigrations();
