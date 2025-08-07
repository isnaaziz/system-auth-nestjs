<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

<h1 align="center">NestJS Authentication System</h1>

<p align="center">
  A comprehensive, production-ready authentication system built with <strong>NestJS</strong>, <strong>TypeORM</strong>, and <strong>MySQL</strong>. Features clean architecture, repository pattern, JWT authentication, session management, and soft delete functionality.
</p>

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
</p>

## Features

- **Modern Stack**: NestJS + TypeORM + MySQL + JWT
- **Authentication**: Local & JWT strategies with Passport
- **User Management**: CRUD operations with role-based access
- **Session Management**: Multiple device support with session tracking
- **Soft Delete**: Data preservation with logical deletion
- **Clean Architecture**: Repository pattern with dependency injection
- **Configuration Management**: Environment-based config with validation
- **Security**: Password hashing, input validation, CORS protection
- **Database**: Migrations, seeders, and relationship management
- **Error Handling**: Global exception filter with proper error responses

## Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd system-auth
   npm install
   ```

2. **Environment Setup:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database configuration:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_DATABASE=system_auth

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_SECRET=your-refresh-secret-key
   JWT_REFRESH_EXPIRES_IN=7d

   # Session Configuration
   SESSION_DURATION=604800000

   # Application Configuration
   APP_PORT=3000
   APP_ENVIRONMENT=development
   APP_DEBUG=true
   APP_CORS_ORIGIN=http://localhost:3000
   APP_GLOBAL_PREFIX=api
   ```

3. **Database Setup:**
   ```bash
   # Create database and run migrations + seeders
   npm run db:setup
   ```

4. **Start Development Server:**
   ```bash
   npm run start:dev
   ```

The application will be running at: `http://localhost:3000/api`

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "phone": "+1234567890"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "your-refresh-token"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <access-token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "refresh_token": "your-refresh-token"
}
```

#### Logout All Sessions
```http
POST /api/auth/logout-all
Authorization: Bearer <access-token>
```

#### Get User Sessions
```http
GET /api/auth/sessions
Authorization: Bearer <access-token>
```

#### Revoke Specific Session
```http
DELETE /api/auth/sessions/:sessionId
Authorization: Bearer <access-token>
```

### User Management Endpoints (Admin Only)

#### Get All Users
```http
GET /api/users
Authorization: Bearer <admin-access-token>
```

#### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <admin-access-token>
```

#### Create User
```http
POST /api/users
Authorization: Bearer <admin-access-token>
Content-Type: application/json

{
  "username": "new_user",
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "full_name": "New User",
  "role": "user"
}
```

#### Update User
```http
PUT /api/users/:id
Authorization: Bearer <admin-access-token>
Content-Type: application/json

{
  "full_name": "Updated Name",
  "email": "updated@example.com"
}
```

#### Delete User (Soft Delete)
```http
DELETE /api/users/:id
Authorization: Bearer <admin-access-token>
```

#### Restore User
```http
PUT /api/users/:id/restore
Authorization: Bearer <admin-access-token>
```

#### Get User Sessions
```http
GET /api/users/:id/sessions
Authorization: Bearer <admin-access-token>
```

#### Revoke All User Sessions
```http
DELETE /api/users/:id/sessions
Authorization: Bearer <admin-access-token>
```

## Architecture

### Project Structure
```
src/
├── auth/                    # Authentication module
│   ├── dto/                # Data Transfer Objects
│   ├── guards/             # Route guards
│   ├── strategies/         # Passport strategies
│   └── auth.service.ts     # Authentication business logic
├── users/                  # User management module
├── entities/               # Database entities
├── repositories/           # Data access layer
├── config/                 # Configuration management
├── common/                 # Shared utilities
│   ├── filters/           # Exception filters
│   └── validators/        # Custom validators
├── database/              # Database setup and migrations
└── main.ts               # Application entry point
```

### Clean Architecture Principles

1. **Separation of Concerns**: Each module has a single responsibility
2. **Dependency Injection**: All dependencies are injected through constructor
3. **Repository Pattern**: Data access abstracted through repositories
4. **Configuration Management**: Environment-based configuration with validation
5. **Error Handling**: Centralized exception handling with proper HTTP responses

### Database Schema

#### Users Table
- `id` (UUID, Primary Key)
- `username` (Unique)
- `email` (Unique)
- `password` (Hashed with bcrypt)
- `full_name`
- `phone`
- `bio`
- `role` (user/admin/moderator)
- `status` (active/inactive/suspended)
- `email_verified_at`
- `last_login_at`
- `created_at`, `updated_at`, `deleted_at`

#### User Sessions Table
- `id` (UUID, Primary Key)
- `user_id` (Foreign Key to users)
- `refresh_token` (Hashed)
- `device_info`
- `ip_address`
- `user_agent`
- `status` (active/expired/revoked)
- `expires_at`
- `last_activity_at`
- `created_at`, `updated_at`, `deleted_at`

## Development

### Available Scripts

```bash
# Development
npm run start:dev          # Start development server with hot reload
npm run start:debug        # Start with debug mode

# Building
npm run build             # Build for production
npm run start:prod        # Start production server

# Database
npm run db:setup          # Setup database (create + migrate + seed)
npm run db:migrate        # Run migrations
npm run db:seed           # Run seeders
npm run db:reset          # Reset database (drop + recreate + migrate + seed)

# Code Quality
npm run lint              # Run ESLint
npm run lint:fix          # Fix ESLint errors
npm run format            # Format code with Prettier
npm run test              # Run unit tests
npm run test:e2e          # Run end-to-end tests
```

### Adding New Features

1. **Create Module**: Use NestJS CLI to generate modules
   ```bash
   nest g module feature-name
   nest g controller feature-name
   nest g service feature-name
   ```

2. **Create Entity**: Define database entity with TypeORM decorators
3. **Create Repository**: Extend BaseRepository for data access
4. **Create DTOs**: Define request/response data structures
5. **Add Validation**: Use class-validator decorators
6. **Write Tests**: Add unit and integration tests

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 3306 |
| `DB_USERNAME` | Database username | - |
| `DB_PASSWORD` | Database password | - |
| `DB_DATABASE` | Database name | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Access token expiry | 15m |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | 7d |
| `SESSION_DURATION` | Session duration (ms) | 604800000 |
| `APP_PORT` | Application port | 3000 |
| `APP_ENVIRONMENT` | Environment | development |

## Default Admin User

After running the seeder, you can login with:
- **Username**: `admin`
- **Email**: `admin@example.com`
- **Password**: `Admin123!`

## Security Features

- **Password Hashing**: bcrypt with salt rounds 12
- **JWT Authentication**: Access & refresh token pattern
- **Input Validation**: class-validator with custom validators
- **SQL Injection Protection**: TypeORM query builder
- **CORS Protection**: Configurable CORS origins
- **Session Management**: Multiple device support with revocation
- **Role-based Access Control**: Admin, User, Moderator roles
- **Soft Delete**: Data preservation for audit trails

## Session Management

The system supports multiple device login with features:
- **Refresh Token**: Token for refreshing expired JWT
- **Device Tracking**: Device info, IP address, user agent
- **Session Expiry**: Automatic expiry for inactive sessions
- **Force Logout**: Admin can logout users from all devices

## Deployment

### Production Build
```bash
npm run build
npm run start:prod
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["npm", "run", "start:prod"]
```

### Environment Setup
1. Set production environment variables
2. Configure reverse proxy (nginx)
3. Setup SSL certificates
4. Configure database connection
5. Setup monitoring and logging

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check existing documentation
- Review the API endpoints

---

**Happy Coding!**
