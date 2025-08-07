import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token obtained from login response',
    example: 'f8d72db1-a5b3-4c2e-9f1d-8e7a6b5c4d3e',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}
