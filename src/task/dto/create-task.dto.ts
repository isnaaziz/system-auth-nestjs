import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority } from '../../entities/task.entity';

export class CreateTaskDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ enum: TaskPriority })
    @IsOptional()
    @IsEnum(TaskPriority)
    priority?: TaskPriority;

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    project_id: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    column_id: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    assignee_id?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    story_points?: number;
}
