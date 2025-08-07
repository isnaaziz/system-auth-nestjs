# System Authentication dengan NestJS

Sistem authentication lengkap menggunakan NestJS dengan manajemen user session, soft delete, dan role-based access control.

## Features

- **Authentication System** - Login/Register dengan JWT
- **User Management** - CRUD users dengan role-based access
- **Session Management** - Multi-device login support dengan refresh tokens
- **Soft Delete** - Data tidak terhapus permanen dari database
- **Role-based Access Control** - Admin, User, Moderator roles
- **Database Migrations** - Struktur database yang terversioning
- **Database Seeding** - Admin user otomatis
- **Validation** - Input validation dengan class-validator
- **Password Hashing** - Bcrypt untuk keamanan password

## Technology Stack

- **Framework**: NestJS
- **Database**: MySQL dengan TypeORM
- **Authentication**: JWT + Passport
- **Validation**: class-validator
- **Password**: bcryptjs
- **Environment**: dotenv

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `username` (Unique)
- `email` (Unique)
- `password` (Hashed)
- `full_name`
- `phone`
- `role` (admin, user, moderator)
- `status` (active, inactive, suspended)
- `last_login_at`
- `email_verified_at`
- `email_verification_token`
- `password_reset_token`
- `password_reset_expires`
- `created_at`
- `updated_at`
- `deleted_at` (Soft Delete)

### User Sessions Table
- `id` (UUID, Primary Key)
- `user_id` (Foreign Key to users)
- `refresh_token` (Unique)
- `device_info`
- `ip_address`
- `user_agent`
- `status` (active, expired, revoked)
- `expires_at`
- `last_activity_at`
- `created_at`
- `updated_at`
- `deleted_at` (Soft Delete)

## Setup & Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd system-auth
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` file dengan konfigurasi database Anda:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=system_auth

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m

# Application Configuration
NODE_ENV=development
PORT=3000
```

### 4. Setup Database
```bash
# Buat database MySQL terlebih dahulu
# CREATE DATABASE system_auth;

# Jalankan migrations dan seeder
npm run db:setup
```

### 5. Start Application
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Endpoints

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "08123456789"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "your-refresh-token"
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer your-jwt-token
Content-Type: application/json

{
  "refresh_token": "your-refresh-token"
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer your-jwt-token
```

#### Get User Sessions
```http
GET /auth/sessions
Authorization: Bearer your-jwt-token
```

#### Logout All Sessions
```http
POST /auth/logout-all
Authorization: Bearer your-jwt-token
```

### User Management (Admin Only)

#### Get All Users
```http
GET /users?page=1&limit=10&search=john
Authorization: Bearer admin-jwt-token
```

#### Get User by ID
```http
GET /users/{user-id}
Authorization: Bearer admin-jwt-token
```

#### Create User
```http
POST /users
Authorization: Bearer admin-jwt-token
Content-Type: application/json

{
  "username": "new_user",
  "email": "newuser@example.com",
  "password": "password123",
  "full_name": "New User",
  "role": "user",
  "status": "active"
}
```

#### Update User
```http
PUT /users/{user-id}
Authorization: Bearer admin-jwt-token
Content-Type: application/json

{
  "full_name": "Updated Name",
  "status": "inactive"
}
```

#### Delete User (Soft Delete)
```http
DELETE /users/{user-id}
Authorization: Bearer admin-jwt-token
```

#### Restore User
```http
PUT /users/{user-id}/restore
Authorization: Bearer admin-jwt-token
```

#### Get User Sessions
```http
GET /users/{user-id}/sessions
Authorization: Bearer admin-jwt-token
```

#### Revoke All User Sessions
```http
DELETE /users/{user-id}/sessions
Authorization: Bearer admin-jwt-token
```

## Role-based Access Control

### Roles Available:
- **admin**: Full access ke semua endpoints
- **moderator**: Access terbatas (bisa dikustomisasi)
- **user**: Access terbatas ke profile dan auth endpoints

### Usage Example:
```typescript
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Get('admin-only')
@Roles(UserRole.ADMIN)
@UseGuards(AuthGuard('jwt'), RolesGuard)
adminOnly() {
  return 'Only admin can access this';
}
```

## Database Commands

```bash
# Setup database (migrations + seeder)
npm run db:setup

# Run migrations only
npm run db:migration:run

# Run seeder only  
npm run db:seed
```

## Default Admin User

Setelah menjalankan seeder, Anda dapat login dengan:
- **Username**: `admin`
- **Email**: `admin@example.com` 
- **Password**: `Admin123!`

## Session Management

Sistem mendukung multiple device login dengan fitur:
- **Refresh Token**: Token untuk refresh JWT yang expired
- **Device Tracking**: Info device, IP address, user agent
- **Session Expiry**: Otomatis expire session yang tidak aktif
- **Force Logout**: Admin bisa logout user dari semua device

## Security Features

- Password di-hash menggunakan bcrypt dengan salt rounds 12
- JWT token dengan expiry time
- Refresh token terpisah dari access token
- Soft delete untuk audit trail
- Input validation di semua endpoint
- Role-based access control

## Development

### Project Structure
```
src/
├── auth/                 # Authentication module
│   ├── decorators/      # Custom decorators
│   ├── dto/             # Data Transfer Objects
│   ├── guards/          # Custom guards
│   └── strategies/      # Passport strategies
├── entities/            # TypeORM entities
├── users/               # User management module
├── database/            # Database related files
│   ├── migrations/      # Database migrations
│   └── seeders/         # Database seeders
└── main.ts             # Application entry point
```

### Adding New Features

1. **Create Module**: `nest g module feature`
2. **Create Service**: `nest g service feature` 
3. **Create Controller**: `nest g controller feature`
4. **Add to AppModule**: Import module di `app.module.ts`

## Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Pastikan MySQL service running
   - Check kredensial di `.env`
   - Pastikan database sudah dibuat

2. **JWT Error**
   - Pastikan `JWT_SECRET` di set di `.env`
   - Check format Bearer token

3. **Migration Error**
   - Pastikan TypeORM config benar
   - Check database permissions

## Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## License

This project is private and unlicensed.

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
