import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KanbanColumn } from '../../entities/kanban-column.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class KanbanColumnRepository extends BaseRepository<KanbanColumn> {
    constructor(
        @InjectRepository(KanbanColumn)
        repo: Repository<KanbanColumn>,
    ) {
        super(repo);
    }

    findByProject(projectId: string) {
        return this.repository.find({
            where: { project_id: projectId },
            order: { order: 'ASC' },
            relations: ['tasks', 'tasks.assignee'],
        });
    }
}
