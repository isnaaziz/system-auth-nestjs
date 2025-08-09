import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { TeamModule } from '../team/team.module';

@Module({
  imports: [AuthModule, UsersModule, TeamModule],
  exports: [AuthModule, UsersModule, TeamModule],
})
export class RoutesModule { }
