import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../common/repositories/user.repository';
import { TeamInviteRepository } from '../common/repositories/team-invite.repository';
import { AcceptInviteDto, InviteDto } from './dto/invite.dto';
import { TeamInviteStatus, TeamInvite } from '../entities/team-invite.entity';
import { UpdateMemberRoleDto } from './dto/invite.dto';
import { AuthService, AuthResponse } from '../auth/auth.service';

@Injectable()
export class TeamService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly inviteRepo: TeamInviteRepository,
        private readonly authService: AuthService,
    ) { }

    async listMembers() {
        return this.userRepo
            .createQueryBuilder('u')
            .select(['u.id', 'u.full_name', 'u.role', 'u.status'])
            .where('u.is_deleted = false')
            .orderBy('u.full_name', 'ASC')
            .getMany();
    }

    async listInvites(status?: TeamInviteStatus) {
        const qb = this.inviteRepo.createQueryBuilder('i')
            .select(['i.id', 'i.email', 'i.role', 'i.status', 'i.expires_at', 'i.inviter_id', 'i.note', 'i.redirect_url', 'i.created_at'])
            .where('i.is_deleted = false');
        if (status) qb.andWhere('i.status = :status', { status });
        return qb.orderBy('i.created_at', 'DESC').getMany();
    }

    async invite(dto: InviteDto, inviterId: string) {
        const existingUser = await this.userRepo.findByEmail(dto.email);
        if (existingUser) {
            if (existingUser.role !== dto.role) {
                await this.userRepo.update(existingUser.id, { role: dto.role } as any);
            }
            return { directAssigned: true, userId: existingUser.id };
        }

        const pending = await this.inviteRepo.findPendingByEmail(dto.email);
        if (pending) return pending;

        const ttlSeconds = dto.expires_in || 60 * 60 * 24 * 7; // default 7 hari
        const expires = new Date(Date.now() + ttlSeconds * 1000);
        return this.inviteRepo.create({
            email: dto.email,
            role: dto.role,
            expires_at: expires,
            note: dto.note,
            redirect_url: dto.redirect_url,
            inviter_id: inviterId,
        });
    }

    async accept(dto: AcceptInviteDto): Promise<AuthResponse & { redirect_url?: string }> {
        const invite = await this.inviteRepo.findByToken(dto.token);
        if (!invite || invite.status !== TeamInviteStatus.PENDING || invite.is_deleted) {
            throw new NotFoundException('Invalid invite token');
        }

        if (invite.expires_at && invite.expires_at < new Date()) {
            await this.inviteRepo.update(invite.id, { status: TeamInviteStatus.EXPIRED } as any);
            throw new BadRequestException('Invitation expired');
        }

        let user = await this.userRepo.findByEmail(invite.email);
        if (!user) {
            if (!dto.password || !dto.username) {
                throw new BadRequestException('username & password required');
            }
            user = await this.userRepo.create({
                email: invite.email,
                username: dto.username,
                password: dto.password,
                full_name: dto.full_name,
                role: invite.role,
                status: 'active',
            } as any);
        } else if (user.role !== invite.role) {
            await this.userRepo.update(user.id, { role: invite.role } as any);
        }

        await this.inviteRepo.update(invite.id, {
            status: TeamInviteStatus.ACCEPTED,
            accepted_at: new Date(),
        } as any);

        const auth = await this.authService.login({ username: user.username, password: dto.password || '' });

        return { ...auth, redirect_url: invite.redirect_url };
    }

    async revoke(inviteId: string) {
        const invite = await this.inviteRepo.findById(inviteId);
        if (!invite || invite.is_deleted) throw new NotFoundException('Invite not found');
        if (invite.status !== TeamInviteStatus.PENDING) {
            throw new BadRequestException('Cannot revoke, not in pending');
        }
        await this.inviteRepo.update(inviteId, {
            status: TeamInviteStatus.REVOKED,
            revoked_at: new Date(),
        } as any);
        return { revoked: true };
    }

    async updateMemberRole(userId: string, dto: UpdateMemberRoleDto) {
        const user = await this.userRepo.findById(userId);
        if (!user || (user as any).is_deleted) throw new NotFoundException('User not found');
        await this.userRepo.update(userId, { role: dto.role } as any);
        return { id: userId, role: dto.role };
    }

    async removeMember(userId: string) {
        await this.userRepo.softDelete(userId);
        return { removed: true };
    }

    async purgeExpiredInvites(): Promise<number> {
        const now = new Date();
        const invites: TeamInvite[] = await this.inviteRepo.createQueryBuilder('i')
            .where('i.is_deleted = false')
            .andWhere('i.status = :status', { status: TeamInviteStatus.PENDING })
            .andWhere('i.expires_at IS NOT NULL AND i.expires_at < :now', { now })
            .getMany();
        for (const inv of invites) {
            await this.inviteRepo.update(inv.id, { status: TeamInviteStatus.EXPIRED } as any);
        }
        return invites.length;
    }
}
