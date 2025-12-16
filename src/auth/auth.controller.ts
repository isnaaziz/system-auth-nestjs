/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  UploadedFile,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiProduces,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MessageResponseDto } from './dto/auth-response.dto';
import { PhotoUploadResponseDto, PhotoDeleteResponseDto } from './dto/photo-response.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '../entities/user.entity';
import { FileUploadService } from '../common/services/file-upload.service';
import type { UploadedFile as FileType } from '../common/services/file-upload.service';
import {
  ApiRegister,
  ApiLogin,
  ApiRefreshToken,
  ApiLogout,
  ApiLogoutAll,
  ApiGetProfile,
  ApiGetSessions,
  ApiRevokeSession,
  ApiUpdateProfile,
  ApiUploadPhoto,
  ApiDeletePhoto,
  ApiChangePassword,
} from '../common/swagger/auth-decorators';

interface RequestWithUser {
  user: User;
  headers: any;
  ip?: string;
  connection?: {
    remoteAddress?: string;
  };
}

@Controller('auth')
@ApiTags('Authentication')
@UseInterceptors(ClassSerializerInterceptor)
@ApiConsumes('application/json')
@ApiProduces('application/json')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly fileUploadService: FileUploadService,
  ) { }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiRegister()
  async register(@Body(ValidationPipe) registerDto: RegisterDto): Promise<any> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  @HttpCode(HttpStatus.OK)
  @ApiLogin()
  async login(
    @Request() req: RequestWithUser,
    @Body() loginDto: LoginDto,
  ): Promise<any> {
    const deviceInfo =
      (req.headers['x-device-info'] as string) || 'Unknown Device';
    const ipAddress = req.ip || req.connection?.remoteAddress || '0.0.0.0';
    const userAgent = (req.headers['user-agent'] as string) || 'Unknown Agent';

    return this.authService.login(loginDto, deviceInfo, ipAddress, userAgent);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiRefreshToken()
  async refreshToken(
    @Body(ValidationPipe) refreshTokenDto: RefreshTokenDto,
  ): Promise<any> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body(ValidationPipe) dto: ForgotPasswordDto): Promise<MessageResponseDto> {
    const result = await this.authService.forgotPassword(dto.email);
    return {
      message: result.message,
      statusCode: HttpStatus.OK,
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body(ValidationPipe) dto: ResetPasswordDto): Promise<MessageResponseDto> {
    const result = await this.authService.resetPassword(dto.token, dto.password);
    return {
      message: result.message,
      statusCode: HttpStatus.OK,
    };
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiLogout()
  async logout(
    @Body() body: { refresh_token: string },
  ): Promise<MessageResponseDto> {
    await this.authService.logout(body.refresh_token);
    return {
      message: 'Logged out successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Post('logout-all')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiLogoutAll()
  async logoutAll(
    @Request() req: RequestWithUser,
  ): Promise<MessageResponseDto> {
    const user: User = req.user;
    await this.authService.logoutAllSessions(user.id);
    return {
      message: 'All sessions logged out successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiGetProfile()
  getProfile(@Request() req: RequestWithUser): Partial<User> {
    const user: User = req.user;
    return user.toJSON();
  }

  @Get('sessions')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiGetSessions()
  async getSessions(@Request() req: RequestWithUser): Promise<any[]> {
    const user: User = req.user;
    return this.authService.getUserSessions(user.id);
  }

  @Delete('sessions/:sessionId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiRevokeSession()
  async revokeSession(
    @Request() req: RequestWithUser,
    @Param('sessionId') sessionId: string,
  ): Promise<MessageResponseDto> {
    const user: User = req.user;
    await this.authService.revokeSession(sessionId, user.id);
    return {
      message: 'Session revoked successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Put('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiUpdateProfile()
  async updateProfile(
    @Request() req: RequestWithUser,
    @Body(ValidationPipe) updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user: User = req.user;
    return this.authService.updateProfile(user.id, updateProfileDto);
  }

  @Put('change-password')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiChangePassword()
  async changePassword(
    @Request() req: RequestWithUser,
    @Body(ValidationPipe) dto: ChangePasswordDto,
  ): Promise<MessageResponseDto> {
    const user: User = req.user;
    await this.authService.changePassword(user.id, dto.current_password, dto.new_password);
    return {
      message: 'Password changed successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Post('profile/photo')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('photo'))
  @ApiUploadPhoto()
  async uploadPhoto(
    @Request() req: RequestWithUser,
    @UploadedFile() file: FileType,
  ): Promise<PhotoUploadResponseDto> {
    const user: User = req.user;

    // Delete old avatar if exists
    if (user.avatar_filename) {
      await this.fileUploadService.deleteAvatar(user.avatar_filename);
    }

    // Upload new avatar
    const { filename, url } = await this.fileUploadService.uploadAvatar(file, user.id);

    // Update user record
    await this.authService.updateAvatar(user.id, url, filename);

    return {
      success: true,
      message: 'Profile photo uploaded successfully',
      avatar_url: url,
      filename: filename,
    };
  }

  @Delete('profile/photo')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiDeletePhoto()
  async deletePhoto(
    @Request() req: RequestWithUser,
  ): Promise<PhotoDeleteResponseDto> {
    const user: User = req.user;
    const result = await this.authService.deleteAvatar(user.id);

    // Delete file from filesystem
    if (result.oldFilename) {
      await this.fileUploadService.deleteAvatar(result.oldFilename);
    }

    return {
      success: true,
      message: 'Profile photo deleted successfully',
    };
  }
}
