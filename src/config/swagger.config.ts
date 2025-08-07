import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
    .setTitle('System Auth API')
    .setDescription(`
# System Auth API Documentation

This API provides comprehensive authentication and user session management features.

## Key Features:
- **User Registration & Login**: Secure user authentication with password validation
- **Single Login Policy**: Only one active session per user (configurable)
- **Session Management**: Track and manage user sessions with device information
- **JWT Token Authentication**: Secure token-based authentication with refresh tokens
- **Database Token Storage**: Tokens are stored in database for better security and validation
- **Soft Delete**: All entities use soft delete with \`is_deleted\` flag
- **Real-time Session Validation**: Tokens are validated against database for each request

## Authentication Flow:
1. **Register**: Create a new user account
2. **Login**: Authenticate and receive access/refresh tokens
3. **Access Protected Routes**: Use Bearer token in Authorization header
4. **Refresh Token**: Get new access token using refresh token
5. **Logout**: Invalidate current session
6. **Logout All**: Invalidate all user sessions

## Database Schema:
- **Schema Name**: \`system-auth\`
- **Tables**: \`users\`, \`user_sessions\`
- **Soft Delete**: All tables use \`is_deleted\` boolean flag
- **Indexing**: Optimized indexes for performance

## Security Features:
- Password hashing with bcrypt
- JWT token validation with database lookup
- Session tracking and management
- IP address and device information logging
- Automatic session cleanup
  `)
    .setVersion('1.0.0')
    .addBearerAuth(
        {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enter your JWT token',
            name: 'Authorization',
            in: 'header',
        },
        'JWT-auth',
    )
    .addTag('Authentication', 'User authentication and registration endpoints')
    .addTag('User Management', 'User profile and session management')
    .addTag('Session Management', 'Active session tracking and control')
    .addTag('System', 'System health and information endpoints')
    .addServer('http://localhost:3000', 'Development server')
    .addServer('https://api.yourdomain.com', 'Production server')
    .setContact(
        'System Auth API Support',
        'https://yourdomain.com/support',
        'support@yourdomain.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

export const swaggerUIOptions = {
    swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
        tryItOutEnabled: true,
    },
    customSiteTitle: 'System Auth API Documentation',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
};
