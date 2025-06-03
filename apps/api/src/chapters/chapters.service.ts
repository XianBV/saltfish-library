import { Injectable } from '@nestjs/common';
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
      where: { id: dto.novelId, userId },
    });
    if (!novel) throw new Error('Novel not found or access denied');

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
        order: lastChapter ? lastChapter.order + 1 : 1,
        userId,
        storageKey,
      },
    });

    return chapter;
  }

  async findAll(novelId: string) {
    return this.prisma.chapter.findMany({
      where: { novelId },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id },
    });
    if (!chapter || chapter.userId !== userId) throw new Error('Access denied');

    const content = await this.r2.downloadText(chapter.storageKey);
    return { ...chapter, content };
  }

  async update(userId: string, id: string, dto: UpdateChapterDto) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id },
    });
    if (!chapter || chapter.userId !== userId) throw new Error('Access denied');

    if (dto.content) {
      await this.r2.uploadText(chapter.storageKey, dto.content);
    }

    return this.prisma.chapter.update({
      where: { id },
      data: { title: dto.title ?? chapter.title },
    });
  }

  async remove(userId: string, id: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id },
    });
    if (!chapter || chapter.userId !== userId) throw new Error('Access denied');

    await this.r2.deleteFile(chapter.storageKey);
    return this.prisma.chapter.delete({ where: { id } });
  }
}
