import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';
import { IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    column_id?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    assignee_id?: string;
}
