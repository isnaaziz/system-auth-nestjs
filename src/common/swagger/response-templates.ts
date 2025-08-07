import { ApiResponseOptions } from '@nestjs/swagger';

// Common response schemas
export const CommonResponses = {
    BadRequest: {
        status: 400,
        description: 'Bad Request - Validation errors',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 400 },
                message: {
                    oneOf: [
                        { type: 'string', example: 'Bad Request' },
                        {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['Field is required', 'Invalid format'],
                        },
                    ],
                },
                error: { type: 'string', example: 'Bad Request' },
                timestamp: { type: 'string', format: 'date-time', example: '2024-12-08T10:30:00.000Z' },
                path: { type: 'string', example: '/api/auth/login' },
            },
        },
    } as ApiResponseOptions,

    Unauthorized: {
        status: 401,
        description: 'Unauthorized - Invalid or expired token',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 401 },
                message: { type: 'string', example: 'Session not found or expired' },
                error: { type: 'string', example: 'Unauthorized' },
            },
        },
    } as ApiResponseOptions,

    Forbidden: {
        status: 403,
        description: 'Forbidden - Insufficient permissions',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 403 },
                message: { type: 'string', example: 'Insufficient permissions' },
                error: { type: 'string', example: 'Forbidden' },
            },
        },
    } as ApiResponseOptions,

    NotFound: {
        status: 404,
        description: 'Not Found - Resource not found',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 404 },
                message: { type: 'string', example: 'Resource not found' },
                error: { type: 'string', example: 'Not Found' },
            },
        },
    } as ApiResponseOptions,

    UnprocessableEntity: {
        status: 422,
        description: 'Unprocessable Entity - Validation failed',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 422 },
                message: {
                    type: 'array',
                    items: { type: 'string' },
                    example: [
                        'Password must contain at least one uppercase letter',
                        'Password must contain at least one lowercase letter',
                        'Password must contain at least one number',
                        'Password must contain at least one special character',
                    ],
                },
                error: { type: 'string', example: 'Unprocessable Entity' },
                timestamp: { type: 'string', format: 'date-time', example: '2024-12-08T10:30:00.000Z' },
                path: { type: 'string', example: '/api/auth/register' },
            },
        },
    } as ApiResponseOptions,

    InternalServerError: {
        status: 500,
        description: 'Internal Server Error',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 500 },
                message: { type: 'string', example: 'Internal server error' },
                error: { type: 'string', example: 'Internal Server Error' },
                timestamp: { type: 'string', format: 'date-time', example: '2024-12-08T10:30:00.000Z' },
                path: { type: 'string', example: '/api/auth/login' },
            },
        },
    } as ApiResponseOptions,
};
