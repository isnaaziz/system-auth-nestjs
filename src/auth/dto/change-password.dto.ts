import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
    @ApiProperty({
        description: 'Current password',
        example: 'OldPassword123!',
    })
    @IsNotEmpty()
    @IsString()
    current_password: string;

    @ApiProperty({
        description: 'New password',
        example: 'NewPassword123!',
        minLength: 6,
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    new_password: string;
}
