import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { createHash, createHmac } from 'crypto';

interface TelegramWebAppInitData {
  auth_date: string;
  hash: string;
  user: string;
  [key: string]: string;
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async verifyTelegramAuth(initData: string): Promise<{ user: any; token: string }> {
    // Parse init data
    const urlParams = new URLSearchParams(initData);
    const data: TelegramWebAppInitData = Object.fromEntries(urlParams);
    
    if (!data.user || !data.hash || !data.auth_date) {
      throw new UnauthorizedException('Неверные данные авторизации');
    }

    // Verify hash
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new UnauthorizedException('Telegram bot token не настроен');
    }

    const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
    
    // Create data check string
    const { hash, ...dataToCheck } = data;
    const dataCheckString = Object.keys(dataToCheck)
      .sort()
      .map(key => `${key}=${dataToCheck[key]}`)
      .join('\n');

    const calculatedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      throw new UnauthorizedException('Неверная подпись данных');
    }

    // Check auth date (not older than 1 day)
    const authDate = parseInt(data.auth_date);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {
      throw new UnauthorizedException('Данные авторизации устарели');
    }

    // Parse user data
    const telegramUser: TelegramUser = JSON.parse(data.user);

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { telegramId: telegramUser.id.toString() },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          telegramId: telegramUser.id.toString(),
          username: telegramUser.username,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name,
          avatarUrl: telegramUser.photo_url,
        },
      });

      // Create default lists for new user
      await this.createDefaultLists(user.id);
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: user.id,
      telegramId: user.telegramId,
    });

    return { user, token };
  }

  private async createDefaultLists(userId: string) {
    const defaultLists = [
      { name: 'Все', type: 'SYSTEM', order: 0 },
      { name: 'Читаю', type: 'SYSTEM', order: 1 },
      { name: 'В планах', type: 'SYSTEM', order: 2 },
      { name: 'Брошено', type: 'SYSTEM', order: 3 },
      { name: 'Прочитано', type: 'SYSTEM', order: 4 },
      { name: 'Любимое', type: 'SYSTEM', order: 5 },
      { name: 'Поделиться', type: 'SYSTEM', order: 6 },
    ];

    await this.prisma.list.createMany({
      data: defaultLists.map(list => ({
        ...list,
        userId,
      })),
    });
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      return user;
    } catch {
      throw new UnauthorizedException('Неверный токен');
    }
  }
}