import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  BeforeUpdate,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

export enum SessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

@Entity('user_sessions', { schema: 'system-auth' })
@Index(['user_id'])
@Index(['refresh_token'])
@Index(['status'])
@Index(['expires_at'])
export class UserSession extends BaseEntity {
  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ length: 255, unique: true })
  refresh_token: string;

  @Column({ type: 'text' })
  access_token: string;

  @Column({ type: 'text', nullable: true })
  device_info?: string;

  @Column({ type: 'inet', nullable: true })
  ip_address?: string;

  @Column({ type: 'text', nullable: true })
  user_agent?: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'active',
  })
  status: string; // Changed to string to match database

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  last_activity_at: Date;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @ManyToOne(() => User, (user) => user.sessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @BeforeUpdate()
  updateTimestamp() {
    this.last_activity_at = new Date();
  }

  isActive(): boolean {
    return (
      this.status === 'active' &&
      !this.is_deleted &&
      new Date() < this.expires_at
    );
  }

  isExpired(): boolean {
    return new Date() >= this.expires_at || this.is_deleted;
  }
}
