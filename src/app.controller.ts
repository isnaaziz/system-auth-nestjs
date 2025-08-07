import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ApiWelcome, ApiHealthCheck } from './common/swagger/app-decorators';

@Controller()
@ApiTags('System')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @ApiWelcome()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiHealthCheck()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
