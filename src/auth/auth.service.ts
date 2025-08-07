import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Inject,
  Logger,
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
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: UserSessionRepository,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    @Inject(sessionConfig.KEY)
    private readonly sessionConfiguration: ConfigType<typeof sessionConfig>,
  ) { }

  async validateUser(username: string, password: string): Promise<User | null> {
    this.logger.debug(`Validating user: ${username}`);

    const user = await this.userRepository.findByUsernameOrEmail(username);

    if (!user) {
      this.logger.warn(`User not found: ${username}`);
      return null;
    }

    if (user.status !== 'active') { // Use string instead of enum
      this.logger.warn(`User not active: ${username}, status: ${user.status}`);
      return null;
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      this.logger.warn(`Invalid password for user: ${username}`);
      return null;
    }

    this.logger.debug(`User validation successful: ${username}`);
    return user;
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    this.logger.debug(`Registering user: ${registerDto.username}`);

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
    this.logger.debug(`User created: ${user.username}`);

    // Generate tokens and create session
    return this.generateTokensAndSession(user);
  }

  async login(
    loginDto: LoginDto,
    deviceInfo?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponse> {
    this.logger.debug(`Login attempt for: ${loginDto.username}`);

    const user = await this.validateUser(loginDto.username, loginDto.password);

    if (!user) {
      this.logger.warn(`Login failed for: ${loginDto.username}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user already has active session
    const hasActiveSession = await this.sessionRepository.hasActiveSession(user.id);
    if (hasActiveSession) {
      this.logger.warn(`User ${user.username} already has active session`);
      throw new UnauthorizedException('User already logged in. Please logout first.');
    }

    // Clean up any expired sessions before creating new one
    await this.sessionRepository.cleanupExpiredSessions();

    // Update last login
    await this.userRepository.update(user.id, { last_login_at: new Date() });
    this.logger.debug(`Login successful for: ${user.username}`);

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
        is_deleted: true,
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

    this.logger.debug(`Generating tokens for user: ${user.username}`);

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.jwtConfiguration.accessTokenExpiresIn,
    });

    const refreshToken = uuidv4();
    const expiresInSeconds = this.parseTimeToSeconds(
      this.jwtConfiguration.accessTokenExpiresIn,
    );

    // Clean up expired sessions before creating session
    await this.sessionRepository.cleanupExpiredSessions();

    // For single login, revoke any existing active sessions
    const activeSessionsCount =
      await this.sessionRepository.countActiveSessionsByUserId(user.id);

    if (activeSessionsCount > 0) {
      await this.sessionRepository.revokeAllUserSessions(user.id);
    }

    // Create session
    const session = await this.sessionRepository.create({
      user_id: user.id,
      refresh_token: refreshToken,
      access_token: accessToken,
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

    this.logger.debug(`Session created for user: ${user.username}`);

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
