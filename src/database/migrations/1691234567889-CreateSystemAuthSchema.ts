import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSystemAuthSchema1691234567889 implements MigrationInterface {
    name = 'CreateSystemAuthSchema1691234567889';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create schema if it doesn't exist
        const schemaName = process.env.DB_SCHEMA || 'system-auth';
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

        // Set search path to include the new schema
        await queryRunner.query(`SET search_path TO "${schemaName}", public`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop schema (be careful with this in production)
        const schemaName = process.env.DB_SCHEMA || 'system-auth';
        await queryRunner.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
    }
}
