const { DataSource } = require('typeorm');
require('dotenv').config();

async function checkDatabaseStructure() {
    console.log('🔍 Checking Database Structure...\n');

    const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: String(process.env.DB_PASSWORD || ''),
        database: process.env.DB_DATABASE || 'dbtesting',
        synchronize: false,
        logging: false,
    });

    try {
        console.log('1. Connecting to database...');
        await dataSource.initialize();
        console.log('✅ Connected successfully!');

        console.log('\n2. Environment variables:');
        console.log(`DB_SCHEMA: ${process.env.DB_SCHEMA}`);

        const schema = process.env.DB_SCHEMA || 'system-auth';

        console.log('\n3. Checking schema existence...');
        const schemas = await dataSource.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = $1
    `, [schema]);
        console.log(`Schema "${schema}" exists:`, schemas.length > 0);

        console.log('\n4. Checking tables in schema...');
        const tables = await dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = $1
    `, [schema]);
        console.log('Tables in schema:', tables.map(t => t.table_name));

        if (tables.find(t => t.table_name === 'users')) {
            console.log('\n5. Checking users table structure...');
            const columns = await dataSource.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = $1 AND table_name = 'users'
        ORDER BY ordinal_position
      `, [schema]);

            console.log('Users table columns:');
            columns.forEach(col => {
                console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
            });

            console.log('\n6. Sample data from users table...');
            const users = await dataSource.query(`
        SELECT id, username, email, role, created_at 
        FROM "${schema}".users 
        LIMIT 3
      `);
            console.log('Sample users:', users);
        }

        if (tables.find(t => t.table_name === 'user_sessions')) {
            console.log('\n7. Checking user_sessions table structure...');
            const sessionColumns = await dataSource.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = $1 AND table_name = 'user_sessions'
        ORDER BY ordinal_position
      `, [schema]);

            console.log('User_sessions table columns:');
            sessionColumns.forEach(col => {
                console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }
}

checkDatabaseStructure();
