import { Expose } from 'class-transformer';

export class AuthResponseDto {
  @Expose()
  access_token: string;

  @Expose()
  refresh_token: string;

  @Expose()
  expires_in: number;

  @Expose()
  token_type?: string = 'Bearer';

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
  @Expose()
  id: string;

  @Expose()
  device_info?: string;

  @Expose()
  ip_address?: string;

  @Expose()
  user_agent?: string;

  @Expose()
  is_active: boolean;

  @Expose()
  last_activity?: Date;

  @Expose()
  expires_at: Date;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;
}

export class MessageResponseDto {
  @Expose()
  message: string;

  @Expose()
  statusCode?: number;
}
