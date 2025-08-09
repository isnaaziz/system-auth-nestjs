import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { TeamInvite } from '../entities/team-invite.entity';
import { User } from '../entities/user.entity';
import { TeamInviteRepository } from '../common/repositories/team-invite.repository';
import { UserRepository } from '../common/repositories/user.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [TypeOrmModule.forFeature([TeamInvite, User]), AuthModule],
    controllers: [TeamController],
    providers: [TeamService, TeamInviteRepository, UserRepository],
    exports: [TeamService],
})
export class TeamModule { }
