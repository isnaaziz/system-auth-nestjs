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
      where: { refresh_token: refreshToken, is_deleted: false },
      relations: ['user'],
    });
  }

  async findByAccessToken(accessToken: string): Promise<UserSession | null> {
    return this.repository.findOne({
      where: { access_token: accessToken, is_deleted: false },
      relations: ['user'],
    });
  }

  async findActiveSessionsByUserId(userId: string): Promise<UserSession[]> {
    return this.repository.find({
      where: { user_id: userId, status: 'active', is_deleted: false },
      order: { last_activity_at: 'DESC' },
    });
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.repository.update(
      { user_id: userId, status: 'active', is_deleted: false },
      { is_deleted: true },
    );
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.repository.update(
      { id: sessionId },
      { is_deleted: true },
    );
  }

  async cleanupExpiredSessions(): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(UserSession)
      .set({ is_deleted: true })
      .where('(expires_at < :now OR status != :status) AND is_deleted = false', {
        now: new Date(),
        status: 'active',
      })
      .execute();
  }

  async getUserSessionsById(userId: string): Promise<UserSession[]> {
    return this.repository.find({
      where: { user_id: userId, is_deleted: false },
      order: { last_activity_at: 'DESC' },
    });
  }

  async countActiveSessionsByUserId(userId: string): Promise<number> {
    return this.repository.count({
      where: { user_id: userId, status: 'active', is_deleted: false },
    });
  }

  async hasActiveSession(userId: string): Promise<boolean> {
    const count = await this.countActiveSessionsByUserId(userId);
    return count > 0;
  }
}
