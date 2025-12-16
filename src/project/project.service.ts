import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectRepository } from '../common/repositories/project.repository';
import { KanbanColumnRepository } from '../common/repositories/kanban-column.repository';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from '../entities/project.entity';

@Injectable()
export class ProjectService {
    constructor(
        private readonly projectRepo: ProjectRepository,
        private readonly columnRepo: KanbanColumnRepository,
    ) { }

    async create(userId: string, dto: CreateProjectDto): Promise<Project> {
        const project = await this.projectRepo.create({
            ...dto,
            owner_id: userId,
        });

        // Create default columns
        const defaultColumns = ['Backlog', 'In Progress', 'Review', 'Done'];
        for (let i = 0; i < defaultColumns.length; i++) {
            await this.columnRepo.create({
                title: defaultColumns[i],
                order: i,
                project_id: project.id,
                color: this.getColumnColor(defaultColumns[i])
            });
        }

        return project;
    }

    private getColumnColor(title: string): string {
        switch (title) {
            case 'Backlog': return '#64748B';
            case 'In Progress': return '#2563EB';
            case 'Review': return '#F59E0B';
            case 'Done': return '#059669';
            default: return '#e2e8f0';
        }
    }

    async findAll(userId: string): Promise<Project[]> {
        return this.projectRepo.findByOwner(userId);
    }

    async findOne(id: string): Promise<Project> {
        const project = await this.projectRepo.findById(id);
        if (!project) throw new NotFoundException('Project not found');
        return project;
    }

    async update(id: string, dto: UpdateProjectDto): Promise<Project> {
        await this.findOne(id);
        return this.projectRepo.update(id, dto);
    }

    async remove(id: string): Promise<void> {
        await this.projectRepo.softDelete(id);
    }

    async getBoard(projectId: string) {
        const columns = await this.columnRepo.findByProject(projectId);
        return columns;
    }
}
