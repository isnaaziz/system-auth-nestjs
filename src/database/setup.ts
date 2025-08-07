import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserSession } from '../entities/user-session.entity';
import { CreateUsersTable1691234567890 } from './migrations/1691234567890-CreateUsersTable';
import { CreateUserSessionsTable1691234567891 } from './migrations/1691234567891-CreateUserSessionsTable';
import { CreateAdminUserSeeder } from './seeders/create-admin-user.seeder';

const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'system_auth',
    synchronize: false,
    logging: true,
    entities: [User, UserSession],
    migrations: [CreateUsersTable1691234567890, CreateUserSessionsTable1691234567891],
    charset: 'utf8mb4',
    timezone: 'Z',
});

async function runMigrations() {
    try {
        console.log('Initializing database connection...');
        await AppDataSource.initialize();

        console.log('Running migrations...');
        await AppDataSource.runMigrations();

        console.log('Running seeders...');
        const seeder = new CreateAdminUserSeeder();
        await seeder.run(AppDataSource);

        console.log('Database setup completed successfully!');
    } catch (error) {
        console.error('Error during database setup:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

runMigrations();
