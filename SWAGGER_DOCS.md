# System Auth API - Swagger Documentation

## Overview
This document provides comprehensive details about the Swagger/OpenAPI documentation setup for the System Auth API.

## Documentation URL
- **Development**: http://localhost:3000/api/docs
- **Production**: https://api.yourdomain.com/api/docs

## Features

### 🔧 Interactive API Documentation
- **Try it out**: Test all endpoints directly from the documentation
- **Authentication**: Built-in JWT token management
- **Response examples**: Detailed request/response examples
- **Parameter validation**: Real-time validation feedback

### 📚 Comprehensive Coverage
- **All Endpoints**: Complete documentation for all API endpoints
- **Request/Response Schemas**: Detailed data models with examples
- **Error Handling**: Comprehensive error response documentation
- **Authentication Flow**: Step-by-step authentication process

### 🎨 Enhanced UI Features
- **Persistent Authorization**: JWT token persists across browser sessions
- **Organized by Tags**: Endpoints grouped by functionality
- **Search and Filter**: Quick endpoint discovery
- **Request Duration**: Performance monitoring built-in

## API Structure

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - Session logout
- `POST /api/auth/logout-all` - Logout all sessions
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/sessions` - List user sessions
- `DELETE /api/auth/sessions/:id` - Revoke specific session

### System Endpoints
- `GET /api` - Welcome message
- `GET /api/health` - Health check

### User Management Endpoints
- `GET /api/users` - List users (admin)
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Soft delete user
- `PUT /api/users/:id/restore` - Restore deleted user
- `GET /api/users/:id/sessions` - Get user sessions
- `DELETE /api/users/:id/sessions` - Logout user sessions

## Authentication in Swagger

### Step 1: Obtain Access Token
1. Use the `POST /api/auth/login` endpoint
2. Provide valid credentials
3. Copy the `access_token` from the response

### Step 2: Authorize in Swagger
1. Click the **"Authorize"** button (🔒) at the top of the page
2. Enter your token in the format: `Bearer your_access_token_here`
3. Click **"Authorize"**
4. The lock icon will change to indicate successful authorization

### Step 3: Test Protected Endpoints
- All protected endpoints will now include your authorization header automatically
- You can test endpoints like `/api/auth/profile` without manually adding headers

## Request/Response Examples

### Registration Example
```json
{
  "username": "john_doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "phone": "+1234567890"
}
```

### Login Response Example
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "f8d72db1-a5b3-4c2e-9f1d-8e7a6b5c4d3e",
  "expires_in": 900,
  "token_type": "Bearer",
  "user": {
    "id": "89449272-3f3e-4972-8e8c-f8b7a6c5b3d1",
    "username": "john_doe",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "role": "user",
    "createdAt": "2024-12-08T10:30:00Z"
  }
}
```

## Error Response Format

### Validation Errors (422)
```json
{
  "statusCode": 422,
  "message": [
    "Username must be at least 3 characters long",
    "Password must contain uppercase, lowercase, number, and special character"
  ],
  "error": "Unprocessable Entity",
  "timestamp": "2024-12-08T10:30:00.000Z",
  "path": "/api/auth/register"
}
```

### Authentication Errors (401)
```json
{
  "statusCode": 401,
  "message": "Session not found or expired",
  "error": "Unauthorized"
}
```

## Data Models

### User Profile
```typescript
{
  id: string;           // UUID
  username: string;     // 3-50 characters
  email: string;        // Valid email format
  full_name?: string;   // 2-100 characters (optional)
  phone?: string;       // Up to 15 characters (optional)
  role: string;         // User role (user, admin, etc.)
  created_at: Date;     // Account creation timestamp
  updated_at: Date;     // Last update timestamp
}
```

### Session Information
```typescript
{
  id: string;           // Session UUID
  device_info?: string; // Device information
  ip_address?: string;  // Client IP address
  user_agent?: string;  // Browser/client information
  is_active: boolean;   // Session status
  last_activity?: Date; // Last activity timestamp
  expires_at: Date;     // Session expiration
  created_at: Date;     // Session creation
  updated_at: Date;     // Last update
}
```

## Security Features

### Token Management
- **Access Token**: Short-lived (15 minutes) for API access
- **Refresh Token**: Longer-lived (7 days) for token renewal
- **Database Storage**: Tokens stored and validated against database
- **Single Login**: Only one active session per user (configurable)

### Session Security
- **IP Tracking**: Session tied to originating IP address
- **Device Fingerprinting**: Device information stored for security
- **Automatic Cleanup**: Expired sessions automatically removed
- **Manual Revocation**: Users can revoke specific sessions

### Password Security
- **Strong Password Policy**: Minimum complexity requirements
- **Bcrypt Hashing**: Secure password storage
- **No Password Exposure**: Passwords never returned in responses

## Testing Workflow

### 1. Register New User
```bash
curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!",
    "full_name": "Test User"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "testuser",
    "password": "SecurePass123!"
  }'
```

### 3. Access Protected Route
```bash
curl -X GET http://localhost:3000/api/auth/profile \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Refresh Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \\
  -H "Content-Type: application/json" \\
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

### 5. Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

## Environment Configuration

### Required Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=mysecretpassword
DB_DATABASE=dbtesting
DB_SCHEMA=system-auth

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Application
PORT=3000
NODE_ENV=development
```

## Troubleshooting

### Common Issues

#### 1. "Cannot read properties of undefined"
- **Cause**: Missing environment variables
- **Solution**: Ensure all required environment variables are set

#### 2. "Database connection failed"
- **Cause**: PostgreSQL not running or wrong credentials
- **Solution**: Check database status and configuration

#### 3. "Session not found or expired"
- **Cause**: Invalid or expired JWT token
- **Solution**: Login again to get new tokens

#### 4. "Validation failed"
- **Cause**: Request data doesn't meet validation requirements
- **Solution**: Check the detailed error messages and adjust request

### Development Tips

1. **Use the Swagger UI**: It's the fastest way to test endpoints
2. **Check the Browser Console**: Swagger UI errors appear in browser console
3. **Monitor the Server Logs**: Backend errors are logged to the console
4. **Use Valid Test Data**: Follow the examples provided in documentation

## Customization

### Adding New Endpoints
1. Create the controller method with proper decorators
2. Add Swagger decorators (@ApiOperation, @ApiResponse, etc.)
3. Create corresponding DTOs with @ApiProperty decorators
4. Update this documentation

### Modifying Error Responses
1. Update the GlobalExceptionFilter
2. Modify error response DTOs
3. Update Swagger documentation examples

### Changing Authentication
1. Modify JWT strategy configuration
2. Update authentication guards
3. Update Swagger security scheme

## Production Deployment

### Before Going Live
1. **Environment Variables**: Set production-specific values
2. **Database**: Configure production PostgreSQL instance
3. **CORS**: Configure appropriate CORS origins
4. **SSL**: Enable HTTPS for production
5. **Logging**: Configure production logging
6. **Monitoring**: Set up health check monitoring

### Security Checklist
- [ ] Strong JWT secrets in production
- [ ] HTTPS enabled
- [ ] Database credentials secured
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Error messages don't expose sensitive data
- [ ] Logs don't contain sensitive information

---

For more information or support, please contact the development team or refer to the source code documentation.
