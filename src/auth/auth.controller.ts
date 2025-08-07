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
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiProduces,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { MessageResponseDto } from './dto/auth-response.dto';
import { User } from '../entities/user.entity';
import {
  ApiRegister,
  ApiLogin,
  ApiRefreshToken,
  ApiLogout,
  ApiLogoutAll,
  ApiGetProfile,
  ApiGetSessions,
  ApiRevokeSession,
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
  constructor(private readonly authService: AuthService) { }

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
}
