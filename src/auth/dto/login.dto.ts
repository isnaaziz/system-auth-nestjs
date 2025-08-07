import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Trim } from '../../common/validators/custom-validators';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Username or email is required' })
  @Trim()
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
