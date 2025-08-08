import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
    @ApiProperty({
        description: 'Full name of the user',
        example: 'John Doe',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    full_name?: string;

    @ApiProperty({
        description: 'Phone number of the user',
        example: '+1234567890',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone?: string;

    @ApiProperty({
        description: 'Bio or description of the user',
        example: 'Software Developer passionate about technology',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    bio?: string;
}
