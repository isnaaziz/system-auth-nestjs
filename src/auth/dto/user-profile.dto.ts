import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
    @ApiProperty({
        description: 'User unique identifier',
        example: '89449272-3f3e-4972-8e8c-f8b7a6c5b3d1',
        type: String,
    })
    id: string;

    @ApiProperty({
        description: 'Username',
        example: 'admin',
        type: String,
    })
    username: string;

    @ApiProperty({
        description: 'User email address',
        example: 'admin@example.com',
        type: String,
    })
    email: string;

    @ApiProperty({
        description: 'User full name',
        example: 'System Administrator',
        type: String,
        required: false,
    })
    full_name?: string;

    @ApiProperty({
        description: 'User phone number',
        example: '+1234567890',
        type: String,
        required: false,
    })
    phone?: string;

    @ApiProperty({
        description: 'User bio or description',
        example: 'Software Developer passionate about technology',
        type: String,
        required: false,
    })
    bio?: string;

    @ApiProperty({
        description: 'User avatar/profile photo URL',
        example: 'http://localhost:3000/uploads/avatars/user-id-123.jpg',
        type: String,
        required: false,
    })
    avatar_url?: string;

    @ApiProperty({
        description: 'User role',
        example: 'admin',
        type: String,
    })
    role: string;

    @ApiProperty({
        description: 'Account creation date',
        example: '2024-12-08T10:30:00Z',
        type: String,
        format: 'date-time',
    })
    created_at: Date;

    @ApiProperty({
        description: 'Last profile update date',
        example: '2024-12-08T10:45:00Z',
        type: String,
        format: 'date-time',
    })
    updated_at: Date;
}
