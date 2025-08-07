import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { UserSession } from '../entities/user-session.entity';
import { UserRepository } from '../common/repositories/user.repository';
import { UserSessionRepository } from '../common/repositories/user-session.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSession])],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, UserSessionRepository],
  exports: [UsersService, UserRepository, UserSessionRepository],
})
export class UsersModule {}
