import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { KanbanColumn } from './kanban-column.entity';
import { Task } from './task.entity';

@Entity('projects', { schema: 'system-auth' })
export class Project extends BaseEntity {
    @Column({ length: 100 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ name: 'owner_id' })
    owner_id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'owner_id' })
    owner: User;

    @OneToMany(() => KanbanColumn, (column) => column.project)
    columns: KanbanColumn[];

    @OneToMany(() => Task, (task) => task.project)
    tasks: Task[];
}
