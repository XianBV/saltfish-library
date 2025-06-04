import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { CreateChapterDto, UpdateChapterDto, ReorderChaptersDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserPayload } from '../auth/types';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Roles(Role.AUTHOR, Role.COAUTHOR, Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateChapterDto, @CurrentUser() user: UserPayload) {
    return this.chaptersService.create(dto, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chaptersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateChapterDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.chaptersService.update(id, dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.chaptersService.remove(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('reorder')
  reorder(@Body() dto: ReorderChaptersDto, @CurrentUser() user: UserPayload) {
    return this.chaptersService.reorder(dto, user.id);
  }
}
