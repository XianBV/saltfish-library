import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChaptersService } from './chapters.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/auth.decorator';
import { CreateChapterDto, UpdateChapterDto, ReorderChaptersDto } from './dto';

@ApiTags('chapters')
@Controller('chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать главу' })
  create(@CurrentUser() user: any, @Body() createChapterDto: CreateChapterDto) {
    return this.chaptersService.create(user.id, createChapterDto);
  }

  @Get('novel/:novelId')
  @ApiOperation({ summary: 'Получить все главы новеллы' })
  findAll(@Param('novelId') novelId: string) {
    return this.chaptersService.findAll(novelId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить главу по ID' })
  findOne(@Param('id') id: string) {
    return this.chaptersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить главу' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateChapterDto: UpdateChapterDto,
  ) {
    return this.chaptersService.update(id, user.id, updateChapterDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить главу' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chaptersService.remove(id, user.id);
  }

  @Put('novel/:novelId/reorder')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Изменить порядок глав' })
  reorder(
    @Param('novelId') novelId: string,
    @CurrentUser() user: any,
    @Body() dto: ReorderChaptersDto,
  ) {
    return this.chaptersService.reorder(novelId, user.id, dto.chapterIds);
  }
}