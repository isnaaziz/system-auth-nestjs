import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
    @ApiProperty({
        description: 'HTTP status code',
        example: 400,
        type: Number,
    })
    statusCode: number;

    @ApiProperty({
        description: 'Error message or array of validation errors',
        oneOf: [
            { type: 'string', example: 'Invalid credentials' },
            {
                type: 'array',
                items: { type: 'string' },
                example: ['Username is required', 'Password must be at least 6 characters'],
            },
        ],
    })
    message: string | string[];

    @ApiProperty({
        description: 'Error type',
        example: 'Bad Request',
        type: String,
    })
    error: string;

    @ApiProperty({
        description: 'Request timestamp',
        example: '2024-12-08T10:30:00.000Z',
        type: String,
        format: 'date-time',
        required: false,
    })
    timestamp?: string;

    @ApiProperty({
        description: 'Request path',
        example: '/api/auth/login',
        type: String,
        required: false,
    })
    path?: string;
}

export class ValidationErrorResponseDto {
    @ApiProperty({
        description: 'HTTP status code',
        example: 422,
        type: Number,
    })
    statusCode: number;

    @ApiProperty({
        description: 'Array of validation error messages',
        type: 'array',
        items: { type: 'string' },
        example: [
            'Username must be at least 3 characters long',
            'Email must be a valid email address',
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        ],
    })
    message: string[];

    @ApiProperty({
        description: 'Error type',
        example: 'Unprocessable Entity',
        type: String,
    })
    error: string;

    @ApiProperty({
        description: 'Request timestamp',
        example: '2024-12-08T10:30:00.000Z',
        type: String,
        format: 'date-time',
    })
    timestamp: string;

    @ApiProperty({
        description: 'Request path',
        example: '/api/auth/register',
        type: String,
    })
    path: string;
}

export class UnauthorizedErrorResponseDto {
    @ApiProperty({
        description: 'HTTP status code',
        example: 401,
        type: Number,
    })
    statusCode: number;

    @ApiProperty({
        description: 'Error message',
        example: 'Session not found or expired',
        type: String,
    })
    message: string;

    @ApiProperty({
        description: 'Error type',
        example: 'Unauthorized',
        type: String,
    })
    error: string;
}

export class NotFoundErrorResponseDto {
    @ApiProperty({
        description: 'HTTP status code',
        example: 404,
        type: Number,
    })
    statusCode: number;

    @ApiProperty({
        description: 'Error message',
        example: 'Session not found',
        type: String,
    })
    message: string;

    @ApiProperty({
        description: 'Error type',
        example: 'Not Found',
        type: String,
    })
    error: string;
}

export class InternalServerErrorResponseDto {
    @ApiProperty({
        description: 'HTTP status code',
        example: 500,
        type: Number,
    })
    statusCode: number;

    @ApiProperty({
        description: 'Error message',
        example: 'Internal server error',
        type: String,
    })
    message: string;

    @ApiProperty({
        description: 'Error type',
        example: 'Internal Server Error',
        type: String,
    })
    error: string;

    @ApiProperty({
        description: 'Request timestamp',
        example: '2024-12-08T10:30:00.000Z',
        type: String,
        format: 'date-time',
    })
    timestamp: string;

    @ApiProperty({
        description: 'Request path',
        example: '/api/auth/login',
        type: String,
    })
    path: string;
}
