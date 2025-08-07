import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateUserSessionsTable1691234567891 implements MigrationInterface {
    name = 'CreateUserSessionsTable1691234567891';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'user_sessions',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid()',
                    },
                    {
                        name: 'user_id',
                        type: 'varchar',
                        length: '36',
                        isNullable: false,
                    },
                    {
                        name: 'refresh_token',
                        type: 'varchar',
                        length: '500',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'device_info',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'ip_address',
                        type: 'varchar',
                        length: '45',
                        isNullable: true,
                    },
                    {
                        name: 'user_agent',
                        type: 'varchar',
                        length: '500',
                        isNullable: true,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['active', 'expired', 'revoked'],
                        default: "'active'",
                    },
                    {
                        name: 'expires_at',
                        type: 'timestamp',
                        isNullable: false,
                    },
                    {
                        name: 'last_activity_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP(6)',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP(6)',
                        onUpdate: 'CURRENT_TIMESTAMP(6)',
                    },
                    {
                        name: 'deleted_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                ],
            }),
            true,
        );

        // Create indices
        await queryRunner.createIndex('user_sessions', new TableIndex({
            name: 'IDX_USER_SESSIONS_USER_ID',
            columnNames: ['user_id']
        }));

        await queryRunner.createIndex('user_sessions', new TableIndex({
            name: 'IDX_USER_SESSIONS_REFRESH_TOKEN',
            columnNames: ['refresh_token'],
            isUnique: true
        }));

        await queryRunner.createIndex('user_sessions', new TableIndex({
            name: 'IDX_USER_SESSIONS_EXPIRES_AT',
            columnNames: ['expires_at']
        }));

        await queryRunner.createIndex('user_sessions', new TableIndex({
            name: 'IDX_USER_SESSIONS_STATUS',
            columnNames: ['status']
        }));

        await queryRunner.createIndex('user_sessions', new TableIndex({
            name: 'IDX_USER_SESSIONS_DELETED_AT',
            columnNames: ['deleted_at']
        }));

        // Create foreign key
        await queryRunner.createForeignKey('user_sessions', new TableForeignKey({
            columnNames: ['user_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
            name: 'FK_USER_SESSIONS_USER_ID'
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('user_sessions', 'FK_USER_SESSIONS_USER_ID');
        await queryRunner.dropTable('user_sessions');
    }
}
