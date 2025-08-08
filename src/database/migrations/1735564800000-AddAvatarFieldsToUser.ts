import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvatarFieldsToUser1735564800000 implements MigrationInterface {
    name = 'AddAvatarFieldsToUser1735564800000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Get schema name from environment variable
        const schemaName = process.env.DB_SCHEMA || 'system-auth';

        // Set search path to include the schema
        await queryRunner.query(`SET search_path TO "${schemaName}", public`);

        // Add photo profile fields to users table
        await queryRunner.query(`
            ALTER TABLE "${schemaName}"."users" 
            ADD COLUMN "bio" text,
            ADD COLUMN "avatar_url" character varying(500),
            ADD COLUMN "avatar_filename" character varying(100)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Get schema name from environment variable
        const schemaName = process.env.DB_SCHEMA || 'system-auth';

        // Set search path to include the schema
        await queryRunner.query(`SET search_path TO "${schemaName}", public`);

        // Remove photo profile fields from users table
        await queryRunner.query(`
            ALTER TABLE "${schemaName}"."users" 
            DROP COLUMN IF EXISTS "bio",
            DROP COLUMN IF EXISTS "avatar_url",
            DROP COLUMN IF EXISTS "avatar_filename"
        `);
    }
}
