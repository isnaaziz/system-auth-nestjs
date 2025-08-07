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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { User } from '../entities/user.entity';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body(ValidationPipe) registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @UseGuards(AuthGuard('local'))
    @HttpCode(HttpStatus.OK)
    async login(@Request() req, @Body() loginDto: LoginDto) {
        const deviceInfo = req.headers['x-device-info'];
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        return this.authService.login(
            loginDto,
            deviceInfo,
            ipAddress,
            userAgent,
        );
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Body(ValidationPipe) refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto);
    }

    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    async logout(@Body() body: { refresh_token: string }) {
        await this.authService.logout(body.refresh_token);
        return { message: 'Logged out successfully' };
    }

    @Post('logout-all')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    async logoutAll(@Request() req) {
        const user: User = req.user;
        await this.authService.logoutAllSessions(user.id);
        return { message: 'All sessions logged out successfully' };
    }

    @Get('profile')
    @UseGuards(AuthGuard('jwt'))
    getProfile(@Request() req) {
        const user: User = req.user;
        return user.toJSON();
    }

    @Get('sessions')
    @UseGuards(AuthGuard('jwt'))
    async getSessions(@Request() req) {
        const user: User = req.user;
        return this.authService.getUserSessions(user.id);
    }

    @Delete('sessions/:sessionId')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    async revokeSession(@Request() req, @Param('sessionId') sessionId: string) {
        const user: User = req.user;
        await this.authService.revokeSession(sessionId, user.id);
        return { message: 'Session revoked successfully' };
    }
}
