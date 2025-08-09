import { Entity, Column, Index, BeforeInsert } from 'typeorm';
import { BaseEntity } from './base.entity';
import { randomBytes } from 'crypto';

export enum TeamInviteStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REVOKED = 'revoked',
    EXPIRED = 'expired',
}

@Entity('team_invites', { schema: 'system-auth' })
@Index(['email'])
@Index(['token'])
export class TeamInvite extends BaseEntity {
    @Column({ length: 255 })
    email: string;

    @Column({ length: 20 })
    role: string;

    @Column({ length: 64, unique: true })
    token: string;

    @Column({ type: 'varchar', length: 20, default: TeamInviteStatus.PENDING })
    status: TeamInviteStatus;

    @Column({ type: 'timestamp', nullable: true })
    accepted_at?: Date;

    @Column({ type: 'timestamp', nullable: true })
    revoked_at?: Date;

    @Column({ type: 'timestamp', nullable: true })
    expires_at?: Date;

    @Column({ length: 255, nullable: true })
    inviter_id?: string;

    @Column({ type: 'text', nullable: true })
    note?: string;

    @Column({ length: 500, nullable: true })
    redirect_url?: string;

    @Column({ type: 'boolean', default: false })
    is_deleted: boolean;

    @BeforeInsert()
    genToken() {
        if (!this.token) {
            this.token = randomBytes(24).toString('hex');
        }
    }
}
