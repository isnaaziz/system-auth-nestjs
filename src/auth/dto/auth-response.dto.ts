import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token for API authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTQ0OTI3Mi0zZjNlLTQ5NzItOGU4Yy1mOGI3YTZjNWIzZDEiLCJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNzMzNjQ2NzM0LCJleHAiOjE3MzM2NDc2MzR9.abc123def456',
    type: String,
  })
  @Expose()
  access_token: string;

  @ApiProperty({
    description: 'Refresh token for obtaining new access tokens',
    example: 'f8d72db1-a5b3-4c2e-9f1d-8e7a6b5c4d3e',
    type: String,
  })
  @Expose()
  refresh_token: string;

  @ApiProperty({
    description: 'Access token expiration time in seconds',
    example: 900,
    type: Number,
  })
  @Expose()
  expires_in: number;

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
    type: String,
    default: 'Bearer',
  })
  @Expose()
  token_type?: string = 'Bearer';

  @ApiProperty({
    description: 'User information',
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'User unique identifier',
        example: '89449272-3f3e-4972-8e8c-f8b7a6c5b3d1',
      },
      username: {
        type: 'string',
        description: 'Username',
        example: 'admin',
      },
      email: {
        type: 'string',
        description: 'User email address',
        example: 'admin@example.com',
      },
      fullName: {
        type: 'string',
        description: 'User full name',
        example: 'System Administrator',
      },
      role: {
        type: 'string',
        description: 'User role',
        example: 'admin',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'Account creation date',
        example: '2024-12-08T10:30:00Z',
      },
    },
  })
  @Expose()
  user: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: string;
    createdAt: Date;
  };
}

export class UserSessionDto {
  @ApiProperty({
    description: 'Session unique identifier',
    example: 'sess_89449272-3f3e-4972-8e8c-f8b7a6c5b3d1',
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Device information from which the session was created',
    example: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    type: String,
    required: false,
  })
  @Expose()
  device_info?: string;

  @ApiProperty({
    description: 'IP address from which the session was created',
    example: '192.168.1.100',
    type: String,
    required: false,
  })
  @Expose()
  ip_address?: string;

  @ApiProperty({
    description: 'User agent information',
    example: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    type: String,
    required: false,
  })
  @Expose()
  user_agent?: string;

  @ApiProperty({
    description: 'Whether the session is currently active',
    example: true,
    type: Boolean,
  })
  @Expose()
  is_active: boolean;

  @ApiProperty({
    description: 'Last activity timestamp',
    example: '2024-12-08T10:45:00Z',
    type: String,
    format: 'date-time',
    required: false,
  })
  @Expose()
  last_activity?: Date;

  @ApiProperty({
    description: 'Session expiration timestamp',
    example: '2024-12-08T18:30:00Z',
    type: String,
    format: 'date-time',
  })
  @Expose()
  expires_at: Date;

  @ApiProperty({
    description: 'Session creation timestamp',
    example: '2024-12-08T10:30:00Z',
    type: String,
    format: 'date-time',
  })
  @Expose()
  created_at: Date;

  @ApiProperty({
    description: 'Session last update timestamp',
    example: '2024-12-08T10:45:00Z',
    type: String,
    format: 'date-time',
  })
  @Expose()
  updated_at: Date;
}

export class MessageResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully',
    type: String,
  })
  @Expose()
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
    type: Number,
    required: false,
  })
  @Expose()
  statusCode?: number;
}
