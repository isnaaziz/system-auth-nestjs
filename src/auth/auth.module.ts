import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { UserSession } from '../entities/user-session.entity';
import { UserRepository } from '../common/repositories/user.repository';
import { UserSessionRepository } from '../common/repositories/user-session.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import jwtConfig from '../config/jwt.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserSession]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.accessTokenExpiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    UserSessionRepository,
    JwtStrategy,
    LocalStrategy,
  ],
  exports: [AuthService, UserRepository, UserSessionRepository],
})
export class AuthModule {}
