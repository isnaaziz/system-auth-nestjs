import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession, SessionStatus } from '../../entities/user-session.entity';
import { BaseRepository } from '../repositories/base.repository';

@Injectable()
export class UserSessionRepository extends BaseRepository<UserSession> {
  constructor(
    @InjectRepository(UserSession)
    sessionRepository: Repository<UserSession>,
  ) {
    super(sessionRepository);
  }

  async findByRefreshToken(refreshToken: string): Promise<UserSession | null> {
    return this.repository.findOne({
      where: { refresh_token: refreshToken },
      relations: ['user'],
    });
  }

  async findActiveSessionsByUserId(userId: string): Promise<UserSession[]> {
    return this.repository.find({
      where: { user_id: userId, status: SessionStatus.ACTIVE },
      order: { last_activity_at: 'DESC' },
    });
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.repository.update(
      { user_id: userId, status: SessionStatus.ACTIVE },
      { status: SessionStatus.REVOKED },
    );
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.repository.update(
      { id: sessionId },
      { status: SessionStatus.REVOKED },
    );
  }

  async cleanupExpiredSessions(): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(UserSession)
      .set({ status: SessionStatus.EXPIRED })
      .where('expires_at < :now AND status = :status', {
        now: new Date(),
        status: SessionStatus.ACTIVE,
      })
      .execute();
  }

  async getUserSessionsById(userId: string): Promise<UserSession[]> {
    return this.repository.find({
      where: { user_id: userId },
      order: { last_activity_at: 'DESC' },
    });
  }

  async countActiveSessionsByUserId(userId: string): Promise<number> {
    return this.repository.count({
      where: { user_id: userId, status: SessionStatus.ACTIVE },
    });
  }
}
