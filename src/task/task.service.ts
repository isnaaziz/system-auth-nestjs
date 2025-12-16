import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskRepository } from '../common/repositories/task.repository';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from '../entities/task.entity';

@Injectable()
export class TaskService {
    constructor(private readonly taskRepo: TaskRepository) { }

    async create(dto: CreateTaskDto): Promise<Task> {
        return this.taskRepo.create(dto);
    }

    async findAll(projectId: string): Promise<Task[]> {
        return this.taskRepo.findByProject(projectId);
    }

    async findOne(id: string): Promise<Task> {
        const task = await this.taskRepo.findById(id);
        if (!task) throw new NotFoundException('Task not found');
        return task;
    }

    async update(id: string, dto: UpdateTaskDto): Promise<Task> {
        await this.findOne(id);
        return this.taskRepo.update(id, dto);
    }

    async remove(id: string): Promise<void> {
        await this.taskRepo.softDelete(id);
    }
}
