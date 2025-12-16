import { IsNotEmpty, MinLength, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @ApiProperty({ example: 'abcdef123456', description: 'Reset token received via email' })
    @IsString()
    @IsNotEmpty()
    token: string;

    @ApiProperty({ example: 'NewPass123!', description: 'New password' })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;
}
