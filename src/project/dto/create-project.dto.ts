import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
    @ApiProperty({ example: 'My Awesome Project' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    name: string;

    @ApiProperty({ example: 'Description of the project', required: false })
    @IsOptional()
    @IsString()
    description?: string;
}
