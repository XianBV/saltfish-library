import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';

class TelegramAuthDto {
  initData: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('telegram')
  @ApiOperation({ summary: 'Авторизация через Telegram WebApp' })
  async telegramAuth(@Body() body: TelegramAuthDto) {
    return this.authService.verifyTelegramAuth(body.initData);
  }
}
