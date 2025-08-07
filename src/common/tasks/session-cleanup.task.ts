import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserSessionRepository } from '../repositories/user-session.repository';

@Injectable()
export class SessionCleanupTask {
    private readonly logger = new Logger(SessionCleanupTask.name);

    constructor(
        private readonly sessionRepository: UserSessionRepository,
    ) { }

    @Cron(CronExpression.EVERY_10_MINUTES)
    async handleCleanupExpiredSessions() {
        this.logger.debug('Running session cleanup task...');

        try {
            await this.sessionRepository.cleanupExpiredSessions();
            this.logger.debug('Session cleanup completed successfully');
        } catch (error) {
            this.logger.error('Error during session cleanup:', error);
        }
    }
}
