import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { Task } from '../entities/task.entity';
import { TaskRepository } from '../common/repositories/task.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Task])],
    controllers: [TaskController],
    providers: [TaskService, TaskRepository],
    exports: [TaskService],
})
export class TaskModule { }
