const { DataSource } = require('typeorm');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function debugLogin() {
    console.log('🔍 Debug Login Process...\n');

    const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: String(process.env.DB_PASSWORD || ''),
        database: process.env.DB_DATABASE || 'dbtesting',
        schema: process.env.DB_SCHEMA || 'public',
        synchronize: false,
        logging: false,
    });

    try {
        console.log('1. Connecting to database...');
        await dataSource.initialize();
        console.log('✅ Connected successfully!');

        console.log('\n2. Environment variables:');
        console.log(`DB_HOST: ${process.env.DB_HOST}`);
        console.log(`DB_PORT: ${process.env.DB_PORT}`);
        console.log(`DB_USERNAME: ${process.env.DB_USERNAME}`);
        console.log(`DB_DATABASE: ${process.env.DB_DATABASE}`);
        console.log(`DB_SCHEMA: ${process.env.DB_SCHEMA}`);

        console.log('\n3. Checking users table...');
        const schema = process.env.DB_SCHEMA || 'public';
        const users = await dataSource.query(`
      SELECT id, username, email, role, status, created_at 
      FROM "${schema}".users 
      LIMIT 5
    `);
        console.log('Users in database:', users);

        console.log('\n4. Looking for admin user...');
        const adminUsers = await dataSource.query(`
      SELECT id, username, email, password, role, status 
      FROM "${schema}".users 
      WHERE username = $1 OR email = $1
    `, ['admin']);

        if (adminUsers.length === 0) {
            console.log('❌ Admin user not found!');
            console.log('\n5. Creating admin user...');

            const hashedPassword = await bcrypt.hash('Admin123!', 12);

            await dataSource.query(`
        INSERT INTO "${schema}".users (username, email, password, full_name, role, status)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
                'admin',
                'admin@example.com',
                hashedPassword,
                'System Administrator',
                'admin',
                'active'
            ]);

            console.log('✅ Admin user created!');
        } else {
            console.log('✅ Admin user found:', {
                id: adminUsers[0].id,
                username: adminUsers[0].username,
                email: adminUsers[0].email,
                role: adminUsers[0].role,
                status: adminUsers[0].status,
                hasPassword: !!adminUsers[0].password
            });

            console.log('\n6. Testing password validation...');
            const testPassword = 'Admin123!';
            const isValid = await bcrypt.compare(testPassword, adminUsers[0].password);
            console.log(`Password "${testPassword}" is valid: ${isValid}`);

            if (!isValid) {
                console.log('\n7. Updating admin password...');
                const newHashedPassword = await bcrypt.hash(testPassword, 12);
                await dataSource.query(`
          UPDATE "${schema}".users 
          SET password = $1 
          WHERE username = 'admin'
        `, [newHashedPassword]);
                console.log('✅ Admin password updated!');
            }
        }

        console.log('\n8. Final admin user check...');
        const finalAdmin = await dataSource.query(`
      SELECT id, username, email, role, status 
      FROM "${schema}".users 
      WHERE username = 'admin'
    `);
        console.log('Final admin user:', finalAdmin[0]);

        console.log('\n9. Testing login API...');
        const axios = require('axios').default;

        try {
            const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
                username: 'admin',
                password: 'Admin123!'
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Login API test successful!');
            console.log('Response:', {
                user: loginResponse.data.user,
                hasAccessToken: !!loginResponse.data.access_token,
                hasRefreshToken: !!loginResponse.data.refresh_token
            });
        } catch (apiError) {
            console.log('❌ Login API test failed:');
            console.log('Status:', apiError.response?.status);
            console.log('Data:', apiError.response?.data);
        }

    } catch (error) {
        console.error('❌ Debug error:', error);
    } finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }
}

debugLogin();
