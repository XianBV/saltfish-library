import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NovelsService } from './novels.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/auth.decorator';
import { CreateNovelDto, UpdateNovelDto, NovelFiltersDto } from './dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('novels')
@Controller('novels')
export class NovelsController {
  constructor(
    private readonly novelsService: NovelsService,
    private readonly prisma: PrismaService,
  ) {}

  @Roles(Role.AUTHOR, Role.ADMIN)
  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать новеллу' })
  create(@CurrentUser() user: any, @Body() createNovelDto: CreateNovelDto) {
    return this.novelsService.create(user.id, createNovelDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить все новеллы пользователя' })
  findAll(@CurrentUser() user: any, @Query() filters: NovelFiltersDto) {
    return this.novelsService.findAll(user.id, filters);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить новеллу по ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.novelsService.findOne(id, user.id);
  }

  @Get('shared/:token')
  @ApiOperation({ summary: 'Получить публичную новеллу по токену' })
  findByToken(@Param('token') token: string) {
    return this.novelsService.findByToken(token);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить новеллу' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateNovelDto: UpdateNovelDto,
  ) {
    return this.novelsService.update(id, user.id, updateNovelDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить новеллу' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.novelsService.remove(id, user.id);
  }

  @Post(':id/share')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать публичную ссылку' })
  generateShareToken(@Param('id') id: string, @CurrentUser() user: any) {
    return this.novelsService.generateShareToken(id, user.id);
  }

  @Delete(':id/share')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отозвать публичную ссылку' })
  revokeShareToken(@Param('id') id: string, @CurrentUser() user: any) {
    return this.novelsService.revokeShareToken(id, user.id);
  }

  @Roles(Role.AUTHOR, Role.ADMIN)
  @Post(':id/coauthors')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Добавить соавтора к новелле' })
  async addCoauthor(
    @Param('id') novelId: string,
    @Body('userId') userId: string,
    @CurrentUser() user: any,
  ) {
    const novel = await this.prisma.novel.findUnique({ where: { id: novelId } });
    if (!novel) throw new NotFoundException('Novel not found');
    if (novel.userId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Access denied');
    }
    return this.prisma.novelCoauthor.create({
      data: { novelId, userId },
    });
  }

  @Roles(Role.AUTHOR, Role.ADMIN)
  @Delete(':id/coauthors/:userId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить соавтора из новеллы' })
  async removeCoauthor(
    @Param('id') novelId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: any,
  ) {
    const novel = await this.prisma.novel.findUnique({ where: { id: novelId } });
    if (!novel) throw new NotFoundException('Novel not found');
    if (novel.userId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Access denied');
    }
    return this.prisma.novelCoauthor.delete({
      where: { novelId_userId: { novelId, userId } },
    });
  }
}