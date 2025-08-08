import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiParam, ApiHeader, ApiConsumes } from '@nestjs/swagger';
import { RegisterDto } from '../../auth/dto/register.dto';
import { LoginDto } from '../../auth/dto/login.dto';
import { RefreshTokenDto } from '../../auth/dto/refresh-token.dto';
import { LogoutDto } from '../../auth/dto/logout.dto';
import { UpdateProfileDto } from '../../auth/dto/update-profile.dto';
import { AuthResponseDto, MessageResponseDto, UserSessionDto } from '../../auth/dto/auth-response.dto';
import { UserProfileDto } from '../../auth/dto/user-profile.dto';
import { PhotoUploadResponseDto, PhotoDeleteResponseDto } from '../../auth/dto/photo-response.dto';
import { CommonResponses } from './response-templates';

export function ApiRegister() {
    return applyDecorators(
        ApiOperation({
            summary: 'Register a new user account',
            description: `Creates a new user account with comprehensive validation and security features.`,
        }),
        ApiBody({
            type: RegisterDto,
            description: 'User registration information',
            examples: {
                basic: {
                    summary: 'Basic registration',
                    value: {
                        username: 'john_doe',
                        email: 'john.doe@example.com',
                        password: 'SecurePass123!',
                    },
                },
                complete: {
                    summary: 'Complete registration',
                    value: {
                        username: 'john_doe',
                        email: 'john.doe@example.com',
                        password: 'SecurePass123!',
                        full_name: 'John Doe',
                        phone: '+1234567890',
                    },
                },
            },
        }),
        ApiResponse({
            status: 201,
            description: 'User registered successfully',
            type: AuthResponseDto,
        }),
        ApiResponse(CommonResponses.BadRequest),
        ApiResponse(CommonResponses.UnprocessableEntity),
    );
}

export function ApiLogin() {
    return applyDecorators(
        ApiOperation({
            summary: 'Authenticate user and create session',
            description: `Authenticates user with single login policy and session tracking.`,
        }),
        ApiHeader({
            name: 'x-device-info',
            description: 'Optional device information for session tracking',
            required: false,
            example: 'iPhone 12 Pro - iOS 15.0',
        }),
        ApiBody({
            type: LoginDto,
            description: 'User login credentials',
            examples: {
                username: {
                    summary: 'Login with username',
                    value: { username: 'admin', password: 'SecurePass123!' },
                },
                email: {
                    summary: 'Login with email',
                    value: { username: 'admin@example.com', password: 'SecurePass123!' },
                },
            },
        }),
        ApiResponse({
            status: 200,
            description: 'Login successful',
            type: AuthResponseDto,
        }),
        ApiResponse(CommonResponses.Unauthorized),
        ApiResponse(CommonResponses.BadRequest),
    );
}

export function ApiRefreshToken() {
    return applyDecorators(
        ApiOperation({
            summary: 'Refresh access token',
            description: `Generates a new access token using a valid refresh token.`,
        }),
        ApiBody({
            type: RefreshTokenDto,
            description: 'Refresh token obtained from login',
        }),
        ApiResponse({
            status: 200,
            description: 'Token refreshed successfully',
            type: AuthResponseDto,
        }),
        ApiResponse(CommonResponses.Unauthorized),
        ApiResponse(CommonResponses.BadRequest),
    );
}

export function ApiLogout() {
    return applyDecorators(
        ApiOperation({
            summary: 'Logout current session',
            description: `Logs out the current user session by invalidating the refresh token.`,
        }),
        ApiBody({
            type: LogoutDto,
            description: 'Refresh token to invalidate',
        }),
        ApiResponse({
            status: 200,
            description: 'Logged out successfully',
            type: MessageResponseDto,
        }),
        ApiResponse(CommonResponses.Unauthorized),
        ApiResponse(CommonResponses.BadRequest),
    );
}

export function ApiLogoutAll() {
    return applyDecorators(
        ApiOperation({
            summary: 'Logout all user sessions',
            description: `Logs out all active sessions for the current user.`,
        }),
        ApiResponse({
            status: 200,
            description: 'All sessions logged out successfully',
            type: MessageResponseDto,
        }),
        ApiResponse(CommonResponses.Unauthorized),
    );
}

export function ApiGetProfile() {
    return applyDecorators(
        ApiOperation({
            summary: 'Get current user profile',
            description: `Retrieves the profile information for the currently authenticated user.`,
        }),
        ApiResponse({
            status: 200,
            description: 'User profile retrieved successfully',
            type: UserProfileDto,
        }),
        ApiResponse(CommonResponses.Unauthorized),
    );
}

export function ApiGetSessions() {
    return applyDecorators(
        ApiOperation({
            summary: 'Get user active sessions',
            description: `Retrieves all active sessions for the current user.`,
        }),
        ApiResponse({
            status: 200,
            description: 'User sessions retrieved successfully',
            type: [UserSessionDto],
        }),
        ApiResponse(CommonResponses.Unauthorized),
    );
}

export function ApiRevokeSession() {
    return applyDecorators(
        ApiOperation({
            summary: 'Revoke a specific user session',
            description: `Revokes a specific session by session ID for the current user.`,
        }),
        ApiParam({
            name: 'sessionId',
            description: 'Unique session identifier to revoke',
            type: String,
            example: 'sess_89449272-3f3e-4972-8e8c-f8b7a6c5b3d1',
        }),
        ApiResponse({
            status: 200,
            description: 'Session revoked successfully',
            type: MessageResponseDto,
        }),
        ApiResponse(CommonResponses.Unauthorized),
        ApiResponse(CommonResponses.NotFound),
        ApiResponse(CommonResponses.BadRequest),
    );
}

export function ApiUpdateProfile() {
    return applyDecorators(
        ApiOperation({
            summary: 'Update user profile',
            description: 'Updates the current user profile information such as full name, phone, and bio.',
        }),
        ApiBody({
            type: UpdateProfileDto,
            description: 'Profile information to update',
            examples: {
                partial: {
                    summary: 'Partial update',
                    value: {
                        full_name: 'John Doe Updated',
                    },
                },
                complete: {
                    summary: 'Complete update',
                    value: {
                        full_name: 'John Doe',
                        phone: '+1234567890',
                        bio: 'Software Developer passionate about technology',
                    },
                },
            },
        }),
        ApiResponse({
            status: 200,
            description: 'Profile updated successfully',
            type: UserProfileDto,
        }),
        ApiResponse(CommonResponses.Unauthorized),
        ApiResponse(CommonResponses.BadRequest),
        ApiResponse(CommonResponses.NotFound),
    );
}

export function ApiUploadPhoto() {
    return applyDecorators(
        ApiOperation({
            summary: 'Upload profile photo',
            description: 'Uploads a new profile photo for the current user. Supports JPEG, PNG, GIF, and WebP formats up to 5MB.',
        }),
        ApiConsumes('multipart/form-data'),
        ApiBody({
            description: 'Profile photo file',
            schema: {
                type: 'object',
                properties: {
                    photo: {
                        type: 'string',
                        format: 'binary',
                        description: 'Profile photo file (JPEG, PNG, GIF, WebP - max 5MB)',
                    },
                },
                required: ['photo'],
            },
        }),
        ApiResponse({
            status: 200,
            description: 'Photo uploaded successfully',
            type: PhotoUploadResponseDto,
        }),
        ApiResponse(CommonResponses.Unauthorized),
        ApiResponse(CommonResponses.BadRequest),
        ApiResponse({
            status: 413,
            description: 'File too large',
            schema: {
                type: 'object',
                properties: {
                    statusCode: { type: 'number', example: 413 },
                    message: { type: 'string', example: 'File size exceeds limit of 5MB' },
                    error: { type: 'string', example: 'Payload Too Large' },
                },
            },
        }),
    );
}

export function ApiDeletePhoto() {
    return applyDecorators(
        ApiOperation({
            summary: 'Delete profile photo',
            description: 'Removes the current user profile photo.',
        }),
        ApiResponse({
            status: 200,
            description: 'Photo deleted successfully',
            type: PhotoDeleteResponseDto,
        }),
        ApiResponse(CommonResponses.Unauthorized),
        ApiResponse(CommonResponses.NotFound),
    );
}
