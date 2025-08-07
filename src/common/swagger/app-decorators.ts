import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiWelcome() {
    return applyDecorators(
        ApiOperation({
            summary: 'Get application welcome message',
            description: 'Returns a welcome message for the System Auth API',
        }),
        ApiResponse({
            status: 200,
            description: 'Welcome message retrieved successfully',
            schema: {
                type: 'string',
                example: 'Hello World!',
            },
        }),
    );
}

export function ApiHealthCheck() {
    return applyDecorators(
        ApiOperation({
            summary: 'Health check endpoint',
            description: `System health status and monitoring information for load balancers and DevOps automation.`,
        }),
        ApiResponse({
            status: 200,
            description: 'System health information',
            schema: {
                type: 'object',
                properties: {
                    status: {
                        type: 'string',
                        example: 'ok',
                        description: 'Application health status',
                    },
                    timestamp: {
                        type: 'string',
                        format: 'date-time',
                        example: '2024-12-08T10:30:00.000Z',
                        description: 'Current server timestamp',
                    },
                    uptime: {
                        type: 'number',
                        example: 3600.123,
                        description: 'Application uptime in seconds',
                    },
                    environment: {
                        type: 'string',
                        example: 'development',
                        description: 'Current environment (development, production, etc.)',
                    },
                },
            },
        }),
    );
}
