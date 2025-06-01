import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChapterDto, UpdateChapterDto } from './dto';

@Injectable()
export class ChaptersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateChapterDto) {
    // Check if user owns the novel
    const novel = await this.prisma.novel.findUnique({
      where: { id: dto.novelId },
    });

    if (!novel) {
      throw new NotFoundException('Новелла не найдена');
    }

    if (novel.userId !== userId) {
      throw new ForbiddenException('Нет прав для добавления главы');
    }

    // Get next order number
    const lastChapter = await this.prisma.chapter.findFirst({
      where: { novelId: dto.novelId },
      orderBy: { order: 'desc' },
    });

    const order = lastChapter ? lastChapter.order + 1 : 1;

    const chapter = await this.prisma.chapter.create({
      data: {
        ...dto,
        order,
      },
    });

    return chapter;
  }

  async findAll(novelId: string, userId?: string) {
    // Check access to novel
    const novel = await this.prisma.novel.findUnique({
      where: { id: novelId },
    });

    if (!novel) {
      throw new NotFoundException('Новелла не найдена');
    }

    const hasAccess = !userId || novel.userId === userId || novel.isPublic;
    if (!hasAccess) {
      throw new ForbiddenException('Нет доступа к главам');
    }

    const chapters = await this.prisma.chapter.findMany({
      where: { novelId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        volumeArk: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return chapters;
  }

  async findOne(id: string, userId?: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id },
      include: {
        novel: {
          select: {
            id: true,
            title: true,
            userId: true,
            isPublic: true,
          },
        },
      },
    });

    if (!chapter) {
      throw new NotFoundException('Глава не найдена');
    }

    // Check access
    const hasAccess = !userId || chapter.novel.userId === userId || chapter.novel.isPublic;
    if (!hasAccess) {
      throw new ForbiddenException('Нет доступа к главе');
    }

    // Get navigation data
    const [prevChapter, nextChapter] = await Promise.all([
      this.prisma.chapter.findFirst({
        where: {
          novelId: chapter.novelId,
          order: { lt: chapter.order },
        },
        orderBy: { order: 'desc' },
        select: { id: true, title: true, order: true },
      }),
      this.prisma.chapter.findFirst({
        where: {
          novelId: chapter.novelId,
          order: { gt: chapter.order },
        },
        orderBy: { order: 'asc' },
        select: { id: true, title: true, order: true },
      }),
    ]);

    return {
      ...chapter,
      navigation: {
        prev: prevChapter,
        next: nextChapter,
      },
    };
  }

  async update(id: string, userId: string, dto: UpdateChapterDto) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id },
      include: {
        novel: true,
      },
    });

    if (!chapter) {
      throw new NotFoundException('Глава не найдена');
    }

    if (chapter.novel.userId !== userId) {
      throw new ForbiddenException('Нет прав для редактирования');
    }

    const updatedChapter = await this.prisma.chapter.update({
      where: { id },
      data: dto,
    });

    return updatedChapter;
  }

  async remove(id: string, userId: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id },
      include: {
        novel: true,
      },
    });

    if (!chapter) {
      throw new NotFoundException('Глава не найдена');
    }

    if (chapter.novel.userId !== userId) {
      throw new ForbiddenException('Нет прав для удаления');
    }

    // Reorder remaining chapters
    await this.prisma.chapter.updateMany({
      where: {
        novelId: chapter.novelId,
        order: { gt: chapter.order },
      },
      data: {
        order: { decrement: 1 },
      },
    });

    await this.prisma.chapter.delete({
      where: { id },
    });

    return { message: 'Глава удалена' };
  }

  async reorder(novelId: string, userId: string, chapterIds: string[]) {
    // Check if user owns the novel
    const novel = await this.prisma.novel.findUnique({
      where: { id: novelId },
    });

    if (!novel) {
      throw new NotFoundException('Новелла не найдена');
    }

    if (novel.userId !== userId) {
      throw new ForbiddenException('Нет прав для изменения порядка глав');
    }

    // Update order for each chapter
    const updatePromises = chapterIds.map((chapterId, index) =>
      this.prisma.chapter.update({
        where: { id: chapterId },
        data: { order: index + 1 },
      })
    );

    await Promise.all(updatePromises);

    return { message: 'Порядок глав обновлен' };
  }
}
