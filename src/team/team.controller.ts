import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards, ValidationPipe, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { TeamService } from './team.service';
import { AcceptInviteDto, InviteDto, RevokeInviteDto, UpdateMemberRoleDto } from './dto/invite.dto';
import { TeamInviteStatus } from '../entities/team-invite.entity';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiBody, ApiOperation } from '@nestjs/swagger';
import { ApiListInvites, ApiInviteMember, ApiAcceptInvite, ApiRevokeInvite, ApiPurgeInvites } from '../common/swagger/auth-decorators';
import { InviteEntityDto, RevokeInviteResponseDto, PurgeExpiredResponseDto, TeamMemberDto } from './dto/invite-response.dto';

@ApiTags('Team')
@ApiBearerAuth('JWT-auth')
@Controller('team')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamController {
    constructor(private readonly teamService: TeamService) { }

    @Get('members')
    @ApiOperation({ summary: 'List team members' })
    @ApiResponse({ status: 200, description: 'Members list', type: TeamMemberDto, isArray: true })
    async members() {
        const data = await this.teamService.listMembers();
        return data.map(m => ({
            id: m.id,
            full_name: m.full_name,
            username: m.username,
            avatar_url: m.avatar_url,
            role: m.role,
            status: m.status
        }));
    }

    @Get('invites')
    @Roles(UserRole.ADMIN)
    @ApiListInvites()
    async listInvites(@Query('status') status?: TeamInviteStatus) {
        return { invites: await this.teamService.listInvites(status) };
    }

    @Post('invite')
    @Roles(UserRole.ADMIN)
    @ApiInviteMember()
    async invite(@Body(ValidationPipe) dto: InviteDto, @Request() req: any) {
        return this.teamService.invite(dto, req.user.id);
    }

    @Post('invite/accept')
    @Public()
    @ApiAcceptInvite()
    async accept(@Body(ValidationPipe) dto: AcceptInviteDto) {
        return this.teamService.accept(dto);
    }

    @Post('invite/revoke')
    @Roles(UserRole.ADMIN)
    @ApiRevokeInvite()
    async revoke(@Body(ValidationPipe) dto: RevokeInviteDto) {
        return this.teamService.revoke(dto.inviteId);
    }

    @Post('invite/resend')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Resend invite' })
    async resend(@Body('inviteId') inviteId: string) {
        return this.teamService.resend(inviteId);
    }

    @Put('members/:id/role')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update member role' })
    @ApiBody({ type: UpdateMemberRoleDto, examples: { change: { value: { role: 'admin' } } } })
    @ApiResponse({ status: 200, description: 'Role updated', schema: { properties: { id: { type: 'string' }, role: { type: 'string' } } } })
    async updateRole(@Param('id') id: string, @Body(ValidationPipe) dto: UpdateMemberRoleDto) {
        return this.teamService.updateMemberRole(id, dto);
    }

    @Delete('members/:id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Remove member (soft delete user)' })
    @ApiResponse({ status: 200, description: 'Member removed', schema: { properties: { removed: { type: 'boolean', example: true } } } })
    async remove(@Param('id') id: string) {
        return this.teamService.removeMember(id);
    }

    @Post('invites/purge-expired')
    @Roles(UserRole.ADMIN)
    @ApiPurgeInvites()
    async purgeExpired() {
        const count = await this.teamService.purgeExpiredInvites();
        return { expired_marked: count } as PurgeExpiredResponseDto;
    }
}
