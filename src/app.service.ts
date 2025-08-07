import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'System Authentication API is running! 🚀';
  }
}
