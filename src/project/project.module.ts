import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { Project } from '../entities/project.entity';
import { KanbanColumn } from '../entities/kanban-column.entity';
import { ProjectRepository } from '../common/repositories/project.repository';
import { KanbanColumnRepository } from '../common/repositories/kanban-column.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Project, KanbanColumn])],
    controllers: [ProjectController],
    providers: [ProjectService, ProjectRepository, KanbanColumnRepository],
    exports: [ProjectService, ProjectRepository],
})
export class ProjectModule { }
