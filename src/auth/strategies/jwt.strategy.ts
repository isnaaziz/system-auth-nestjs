import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { User } from '../../entities/user.entity';
import { UserRepository } from '../../common/repositories/user.repository';
import { UserSessionRepository } from '../../common/repositories/user-session.repository';
import jwtConfig from '../../config/jwt.config';

export interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: UserSessionRepository,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfiguration.secret,
      passReqToCallback: true, // Enable access to request object
    });
  }

  async validate(req: any, payload: JwtPayload): Promise<User> {
    // Extract token from Authorization header
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    // Check if token exists in active session
    const session = await this.sessionRepository.findByAccessToken(token);

    if (!session || !session.isActive()) {
      throw new UnauthorizedException('Session not found or expired');
    }

    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('User account is not active');
    }

    // Update last activity
    await this.sessionRepository.update(session.id, {
      last_activity_at: new Date(),
    });

    return user;
  }
}
