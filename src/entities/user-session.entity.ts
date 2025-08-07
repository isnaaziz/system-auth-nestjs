import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

export enum SessionStatus {
    ACTIVE = 'active',
    EXPIRED = 'expired',
    REVOKED = 'revoked',
}

@Entity('user_sessions')
@Index(['user_id'])
@Index(['refresh_token'], { unique: true })
@Index(['expires_at'])
export class UserSession extends BaseEntity {
    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ length: 500, unique: true })
    refresh_token: string;

    @Column({ length: 255, nullable: true })
    device_info?: string;

    @Column({ length: 45, nullable: true })
    ip_address?: string;

    @Column({ length: 500, nullable: true })
    user_agent?: string;

    @Column({
        type: 'enum',
        enum: SessionStatus,
        default: SessionStatus.ACTIVE,
    })
    status: SessionStatus;

    @Column({ type: 'timestamp' })
    expires_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    last_activity_at?: Date;

    @ManyToOne(() => User, (user) => user.sessions, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    user: User;

    isExpired(): boolean {
        return this.expires_at < new Date();
    }

    isActive(): boolean {
        return this.status === SessionStatus.ACTIVE && !this.isExpired();
    }
}
