import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTeamInvitesTable1733788800001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'team_invites',
            schema: 'system-auth',
            columns: [
                { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
                { name: 'email', type: 'varchar', length: '255' },
                { name: 'role', type: 'varchar', length: '20' },
                { name: 'token', type: 'varchar', length: '64', isUnique: true },
                { name: 'status', type: 'varchar', length: '20', default: `'pending'` },
                { name: 'accepted_at', type: 'timestamp', isNullable: true },
                { name: 'revoked_at', type: 'timestamp', isNullable: true },
                { name: 'expires_at', type: 'timestamp', isNullable: true },
                { name: 'inviter_id', type: 'varchar', length: '255', isNullable: true },
                { name: 'note', type: 'text', isNullable: true },
                { name: 'redirect_url', type: 'varchar', length: '500', isNullable: true },
                { name: 'is_deleted', type: 'boolean', default: false },
                { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
                { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
                { name: 'deleted_at', type: 'timestamp', isNullable: true },
            ],
            indices: [
                { name: 'IDX_team_invites_email', columnNames: ['email'] },
                { name: 'IDX_team_invites_token', columnNames: ['token'] },
                { name: 'IDX_team_invites_status', columnNames: ['status'] },
            ],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('system-auth.team_invites');
    }
}
