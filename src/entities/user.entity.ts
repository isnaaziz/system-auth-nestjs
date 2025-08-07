import {
    Entity,
    Column,
    Index,
    OneToMany,
    BeforeInsert,
    BeforeUpdate,
} from 'typeorm';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import * as bcrypt from 'bcryptjs';
import { BaseEntity } from './base.entity';
import { UserSession } from './user-session.entity';

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
}

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    MODERATOR = 'moderator',
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
export class User extends BaseEntity {
    @Column({ length: 50, unique: true })
    @IsNotEmpty()
    username: string;

    @Column({ length: 255, unique: true })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @Column({ length: 255 })
    @MinLength(6)
    password: string;

    @Column({ length: 100, nullable: true })
    full_name?: string;

    @Column({ length: 20, nullable: true })
    phone?: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole;

    @Column({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.ACTIVE,
    })
    status: UserStatus;

    @Column({ type: 'timestamp', nullable: true })
    last_login_at?: Date;

    @Column({ type: 'timestamp', nullable: true })
    email_verified_at?: Date;

    @Column({ length: 255, nullable: true })
    email_verification_token?: string;

    @Column({ length: 255, nullable: true })
    password_reset_token?: string;

    @Column({ type: 'timestamp', nullable: true })
    password_reset_expires?: Date;

    @OneToMany(() => UserSession, (session) => session.user)
    sessions: UserSession[];

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password && !this.password.startsWith('$2a$')) {
            const salt = await bcrypt.genSalt(12);
            this.password = await bcrypt.hash(this.password, salt);
        }
    }

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }

    toJSON() {
        const { password, email_verification_token, password_reset_token, ...result } = this;
        return result;
    }
}
