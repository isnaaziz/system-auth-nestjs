import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  IsStrongPassword,
  Trim,
  ToLowerCase,
} from '../../common/validators/custom-validators';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(50, { message: 'Username must not exceed 50 characters' })
  @Trim()
  username: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @ToLowerCase()
  @Trim()
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @IsStrongPassword()
  password: string;

  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Full name must not exceed 100 characters' })
  @Trim()
  @Transform(({ value }) => value?.replace(/\s+/g, ' ')) // Replace multiple spaces with single space
  full_name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(15, { message: 'Phone number must not exceed 15 characters' })
  @Trim()
  phone?: string;
}
