import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Trim } from '../../common/validators/custom-validators';

export class LoginDto {
  @ApiProperty({
    description: 'Username or email address for authentication',
    example: 'admin',
    type: String,
    minLength: 1,
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Username or email is required' })
  @Trim()
  username: string;

  @ApiProperty({
    description: 'User password for authentication',
    example: 'SecurePass123!',
    type: String,
    minLength: 6,
    required: true,
    format: 'password',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
