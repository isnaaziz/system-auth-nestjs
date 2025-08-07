import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User, UserStatus } from '../entities/user.entity';
import { UserSession, SessionStatus } from '../entities/user-session.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtPayload } from './strategies/jwt.strategy';

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: Partial<User>;
    expires_in: number;
}

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(UserSession)
        private readonly sessionRepository: Repository<UserSession>,
        private readonly jwtService: JwtService,
    ) { }

    async validateUser(username: string, password: string): Promise<User | null> {
        const user = await this.userRepository.findOne({
            where: [{ username }, { email: username }],
        });

        if (!user || user.status !== UserStatus.ACTIVE) {
            return null;
        }

        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            return null;
        }

        return user;
    }

    async register(registerDto: RegisterDto): Promise<AuthResponse> {
        // Check if user already exists
        const existingUser = await this.userRepository.findOne({
            where: [
                { username: registerDto.username },
                { email: registerDto.email },
            ],
        });

        if (existingUser) {
            throw new ConflictException('Username or email already exists');
        }

        // Create new user
        const user = this.userRepository.create(registerDto);
        const savedUser = await this.userRepository.save(user);

        // Generate tokens and create session
        return this.generateTokensAndSession(savedUser);
    }

    async login(
        loginDto: LoginDto,
        deviceInfo?: string,
        ipAddress?: string,
        userAgent?: string,
    ): Promise<AuthResponse> {
        const user = await this.validateUser(loginDto.username, loginDto.password);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Update last login
        user.last_login_at = new Date();
        await this.userRepository.save(user);

        // Generate tokens and create session
        return this.generateTokensAndSession(user, deviceInfo, ipAddress, userAgent);
    }

    async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
        const session = await this.sessionRepository.findOne({
            where: { refresh_token: refreshTokenDto.refresh_token },
            relations: ['user'],
        });

        if (!session || !session.isActive()) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        // Update session activity
        session.last_activity_at = new Date();
        await this.sessionRepository.save(session);

        // Generate new tokens
        return this.generateTokensAndSession(session.user);
    }

    async logout(refreshToken: string): Promise<void> {
        const session = await this.sessionRepository.findOne({
            where: { refresh_token: refreshToken },
        });

        if (session) {
            session.status = SessionStatus.REVOKED;
            await this.sessionRepository.save(session);
        }
    }

    async logoutAllSessions(userId: string): Promise<void> {
        await this.sessionRepository.update(
            { user_id: userId, status: SessionStatus.ACTIVE },
            { status: SessionStatus.REVOKED },
        );
    }

    async revokeSession(sessionId: string, userId: string): Promise<void> {
        const session = await this.sessionRepository.findOne({
            where: { id: sessionId, user_id: userId },
        });

        if (!session) {
            throw new BadRequestException('Session not found');
        }

        session.status = SessionStatus.REVOKED;
        await this.sessionRepository.save(session);
    }

    async getUserSessions(userId: string): Promise<UserSession[]> {
        return this.sessionRepository.find({
            where: { user_id: userId, status: SessionStatus.ACTIVE },
            order: { last_activity_at: 'DESC' },
        });
    }

    async cleanupExpiredSessions(): Promise<void> {
        const expiredSessions = await this.sessionRepository
            .createQueryBuilder()
            .update(UserSession)
            .set({ status: SessionStatus.EXPIRED })
            .where('expires_at < :now AND status = :status', {
                now: new Date(),
                status: SessionStatus.ACTIVE,
            })
            .execute();
    }

    private async generateTokensAndSession(
        user: User,
        deviceInfo?: string,
        ipAddress?: string,
        userAgent?: string,
    ): Promise<AuthResponse> {
        const payload: JwtPayload = {
            sub: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        };

        const accessToken = this.jwtService.sign(payload, {
            expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        });

        const refreshToken = uuidv4();
        const expiresIn = 15 * 60; // 15 minutes in seconds

        // Create session
        const session = this.sessionRepository.create({
            user_id: user.id,
            refresh_token: refreshToken,
            device_info: deviceInfo,
            ip_address: ipAddress,
            user_agent: userAgent,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            last_activity_at: new Date(),
        });

        await this.sessionRepository.save(session);

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: user.toJSON(),
            expires_in: expiresIn,
        };
    }
}
