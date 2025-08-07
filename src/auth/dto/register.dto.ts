import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsStrongPassword,
  Trim,
  ToLowerCase,
} from '../../common/validators/custom-validators';

export class RegisterDto {
  @ApiProperty({
    description: 'Unique username for the account',
    example: 'john_doe',
    type: String,
    minLength: 3,
    maxLength: 50,
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(50, { message: 'Username must not exceed 50 characters' })
  @Trim()
  username: string;

  @ApiProperty({
    description: 'Valid email address for the account',
    example: 'john.doe@example.com',
    type: String,
    format: 'email',
    required: true,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @ToLowerCase()
  @Trim()
  email: string;

  @ApiProperty({
    description: 'Strong password with at least 8 characters, including uppercase, lowercase, number, and special character',
    example: 'SecurePass123!',
    type: String,
    minLength: 8,
    format: 'password',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    type: String,
    minLength: 2,
    maxLength: 100,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Full name must not exceed 100 characters' })
  @Trim()
  @Transform(({ value }) => value?.replace(/\s+/g, ' ')) // Replace multiple spaces with single space
  full_name?: string;

  @ApiProperty({
    description: 'Phone number (optional)',
    example: '+1234567890',
    type: String,
    maxLength: 15,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(15, { message: 'Phone number must not exceed 15 characters' })
  @Trim()
  phone?: string;
}
