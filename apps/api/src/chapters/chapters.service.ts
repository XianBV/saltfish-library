import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChapterDto, UpdateChapterDto } from './dto';
import { R2Service } from '../storage/r2.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChaptersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2: R2Service,
  ) {}

  async create(userId: string, dto: CreateChapterDto) {
    const novel = await this.prisma.novel.findUnique({
      where: { id: dto.novelId },
      include: { novelCoauthors: true },
    });

    if (!novel || (novel.userId !== userId && !novel.novelCoauthors.some(c => c.userId === userId))) {
      throw new ForbiddenException('Нет доступа к созданию главы');
    }

    const lastChapter = await this.prisma.chapter.findFirst({
      where: { novelId: dto.novelId },
      orderBy: { order: 'desc' },
    });

    const storageKey = `chapters/${uuidv4()}.txt`;
    await this.r2.uploadText(storageKey, dto.content);

    const chapter = await this.prisma.chapter.create({
      data: {
        title: dto.title,
        novelId: dto.novelId,
        volumeArk: dto.volumeArk,
        contentKey: storageKey,
        order: lastChapter ? lastChapter.order + 1 : 1,
      },
    });

    return chapter;
  }

  async update(id: string, userId: string, dto: UpdateChapterDto) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id },
      include: {
        novel: {
          include: { novelCoauthors: true },
        },
      },
    });

    if (!chapter) throw new NotFoundException('Глава не найдена');

    const novel = chapter.novel;
    const isCoauthor = novel.novelCoauthors.some(c => c.userId === userId);
    const hasAccess = novel.userId === userId || isCoauthor;

    if (!hasAccess) throw new ForbiddenException('Нет доступа к редактированию');

    if (dto.content) {
      await this.r2.uploadText(chapter.contentKey, dto.content);
    }

    return this.prisma.chapter.update({
      where: { id },
      data: {
        title: dto.title,
        volumeArk: dto.volumeArk,
      },
    });
  }

  async remove(id: string, userId: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id },
      include: {
        novel: {
          include: { novelCoauthors: true },
        },
      },
    });

    if (!chapter) throw new NotFoundException('Глава не найдена');

    const novel = chapter.novel;
    const isCoauthor = novel.novelCoauthors.some(c => c.userId === userId);
    const hasAccess = novel.userId === userId || isCoauthor;

    if (!hasAccess) throw new ForbiddenException('Нет доступа к удалению');

    await this.r2.deleteFile(chapter.contentKey);
    return this.prisma.chapter.delete({ where: { id } });
  }
}
