import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Project } from './project.entity';
import { Task } from './task.entity';

@Entity('kanban_columns', { schema: 'system-auth' })
export class KanbanColumn extends BaseEntity {
    @Column({ length: 50 })
    title: string;

    @Column({ type: 'int', default: 0 })
    order: number;

    @Column({ type: 'int', nullable: true })
    wip_limit?: number;

    @Column({ length: 20, default: '#e2e8f0' })
    color: string;

    @Column({ name: 'project_id' })
    project_id: string;

    @ManyToOne(() => Project, (project) => project.columns, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'project_id' })
    project: Project;

    @OneToMany(() => Task, (task) => task.column)
    tasks: Task[];
}
