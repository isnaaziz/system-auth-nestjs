import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Project } from './project.entity';
import { KanbanColumn } from './kanban-column.entity';
import { User } from './user.entity';

export enum TaskPriority {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
    CRITICAL = 'Critical',
}

@Entity('tasks', { schema: 'system-auth' })
export class Task extends BaseEntity {
    @Column({ length: 255 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({
        type: 'enum',
        enum: TaskPriority,
        default: TaskPriority.MEDIUM,
    })
    priority: TaskPriority;

    @Column({ type: 'int', default: 0 })
    story_points: number;

    @Column({ type: 'timestamp', nullable: true })
    due_date?: Date;

    @Column({ type: 'simple-array', nullable: true })
    labels?: string[];

    @Column({ type: 'int', default: 0 })
    attachments_count: number;

    @Column({ type: 'int', default: 0 })
    comments_count: number;

    @Column({ name: 'project_id' })
    project_id: string;

    @ManyToOne(() => Project, (project) => project.tasks, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'project_id' })
    project: Project;

    @Column({ name: 'column_id' })
    column_id: string;

    @ManyToOne(() => KanbanColumn, (column) => column.tasks, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'column_id' })
    column: KanbanColumn;

    @Column({ name: 'assignee_id', nullable: true })
    assignee_id?: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'assignee_id' })
    assignee?: User;
}
