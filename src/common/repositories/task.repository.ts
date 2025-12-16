import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../entities/task.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class TaskRepository extends BaseRepository<Task> {
    constructor(
        @InjectRepository(Task)
        repo: Repository<Task>,
    ) {
        super(repo);
    }

    findByProject(projectId: string) {
        return this.repository.find({
            where: { project_id: projectId },
            relations: ['assignee', 'column'],
        });
    }

    async findById(id: string): Promise<Task | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['assignee', 'column', 'project'],
        });
    }
}
