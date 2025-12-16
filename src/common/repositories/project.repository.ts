import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class ProjectRepository extends BaseRepository<Project> {
    constructor(
        @InjectRepository(Project)
        projectRepo: Repository<Project>,
    ) {
        super(projectRepo);
    }

    findByOwner(ownerId: string) {
        return this.repository.find({ where: { owner_id: ownerId } });
    }
}
