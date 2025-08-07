import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserStatus } from '../entities/user.entity';
import { UserSession, SessionStatus } from '../entities/user-session.entity';
import { UserRepository } from '../common/repositories/user.repository';
import { UserSessionRepository } from '../common/repositories/user-session.repository';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import jwtConfig from '../config/jwt.config';
import sessionConfig from '../config/session.config';

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: Partial<User>;
  expires_in: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: UserSessionRepository,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    @Inject(sessionConfig.KEY)
    private readonly sessionConfiguration: ConfigType<typeof sessionConfig>,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByUsernameOrEmail(username);

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
    const userExists = await this.userRepository.existsByUsernameOrEmail(
      registerDto.username,
      registerDto.email,
    );

    if (userExists) {
      throw new ConflictException('Username or email already exists');
    }

    // Create new user
    const user = await this.userRepository.create(registerDto);

    // Generate tokens and create session
    return this.generateTokensAndSession(user);
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
    await this.userRepository.update(user.id, { last_login_at: new Date() });

    // Generate tokens and create session
    return this.generateTokensAndSession(
      user,
      deviceInfo,
      ipAddress,
      userAgent,
    );
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    const session = await this.sessionRepository.findByRefreshToken(
      refreshTokenDto.refresh_token,
    );

    if (!session || !session.isActive()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Update session activity
    await this.sessionRepository.update(session.id, {
      last_activity_at: new Date(),
    });

    // Generate new tokens
    return this.generateTokensAndSession(session.user);
  }

  async logout(refreshToken: string): Promise<void> {
    const session =
      await this.sessionRepository.findByRefreshToken(refreshToken);

    if (session) {
      await this.sessionRepository.update(session.id, {
        status: SessionStatus.REVOKED,
      });
    }
  }

  async logoutAllSessions(userId: string): Promise<void> {
    await this.sessionRepository.revokeAllUserSessions(userId);
  }

  async revokeSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);

    if (!session || session.user_id !== userId) {
      throw new BadRequestException('Session not found');
    }

    await this.sessionRepository.revokeSession(sessionId);
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    return this.sessionRepository.findActiveSessionsByUserId(userId);
  }

  async cleanupExpiredSessions(): Promise<void> {
    await this.sessionRepository.cleanupExpiredSessions();
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
      expiresIn: this.jwtConfiguration.accessTokenExpiresIn,
    });

    const refreshToken = uuidv4();
    const expiresInSeconds = this.parseTimeToSeconds(
      this.jwtConfiguration.accessTokenExpiresIn,
    );

    // Check session limit
    const activeSessionsCount =
      await this.sessionRepository.countActiveSessionsByUserId(user.id);

    if (activeSessionsCount >= this.sessionConfiguration.maxActiveSessions) {
      // Revoke oldest session
      const oldestSessions =
        await this.sessionRepository.findActiveSessionsByUserId(user.id);
      if (oldestSessions.length > 0) {
        await this.sessionRepository.revokeSession(
          oldestSessions[oldestSessions.length - 1].id,
        );
      }
    }

    // Create session
    const session = await this.sessionRepository.create({
      user_id: user.id,
      refresh_token: refreshToken,
      device_info: deviceInfo,
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: new Date(
        Date.now() +
          this.parseTimeToMilliseconds(
            this.jwtConfiguration.refreshTokenExpiresIn,
          ),
      ),
      last_activity_at: new Date(),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: user.toJSON(),
      expires_in: expiresInSeconds,
    };
  }

  private parseTimeToSeconds(timeString: string): number {
    const match = timeString.match(/^(\d+)([smhd])$/);
    if (!match) return 15 * 60; // default 15 minutes

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 15 * 60;
    }
  }

  private parseTimeToMilliseconds(timeString: string): number {
    return this.parseTimeToSeconds(timeString) * 1000;
  }
}
