import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamInvite, TeamInviteStatus } from '../../entities/team-invite.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class TeamInviteRepository extends BaseRepository<TeamInvite> {
    constructor(
        @InjectRepository(TeamInvite)
        repo: Repository<TeamInvite>,
    ) {
        super(repo);
    }

    findByToken(token: string) {
        return this.repository.findOne({ where: { token, is_deleted: false } });
    }

    findPendingByEmail(email: string) {
        return this.repository.findOne({ where: { email, status: TeamInviteStatus.PENDING, is_deleted: false } });
    }

    async softDelete(id: string): Promise<void> {
        await this.repository.update(id, { is_deleted: true } as any);
    }
}
