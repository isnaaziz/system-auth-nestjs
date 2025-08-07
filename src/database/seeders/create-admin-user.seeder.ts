import { DataSource } from 'typeorm';
import { User, UserRole, UserStatus } from '../../entities/user.entity';

export class CreateAdminUserSeeder {
    public async run(dataSource: DataSource): Promise<void> {
        const userRepository = dataSource.getRepository(User);

        // Check if admin user already exists
        const existingAdmin = await userRepository.findOne({
            where: { username: 'admin' },
        });

        if (existingAdmin) {
            console.log('Admin user already exists. Skipping...');
            return;
        }

        // Create admin user
        const adminUser = userRepository.create({
            username: 'admin',
            email: 'admin@example.com',
            password: 'Admin123!', // This will be hashed by the entity beforeInsert hook
            full_name: 'System Administrator',
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
            email_verified_at: new Date(),
        });

        await userRepository.save(adminUser);
        console.log('Admin user created successfully!');
        console.log('Username: admin');
        console.log('Email: admin@example.com');
        console.log('Password: Admin123!');
    }
}
