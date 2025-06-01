import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNovelDto, UpdateNovelDto, NovelFiltersDto } from './dto';
import { randomBytes } from 'crypto';

@Injectable()
export class NovelsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateNovelDto) {
    const { tags, authors, ...novelData } = dto;

    // Create novel
    const novel = await this.prisma.novel.create({
      data: {
        ...novelData,
        userId,
      },
      include: {
        novelTags: {
          include: { tag: true }
        },
        novelAuthors: {
          include: { author: true }
        },
        chapters: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { chapters: true }
        }
      },
      orderBy: filters?.sortBy === 'year' ? { year: 'desc' } : { title: 'asc' },
    });

    return novels;
  }

  async findOne(id: string, userId?: string) {
    const novel = await this.prisma.novel.findUnique({
      where: { id },
      include: {
        novelTags: {
          include: { tag: true }
        },
        novelAuthors: {
          include: { author: true }
        },
        chapters: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            volumeArk: true,
            order: true,
            createdAt: true,
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            avatarUrl: true,
            bio: true,
          }
        },
        _count: {
          select: { chapters: true }
        }
      },
    });

    if (!novel) {
      throw new NotFoundException('Новелла не найдена');
    }

    // Check access
    const hasAccess = !userId || novel.userId === userId || novel.isPublic;
    if (!hasAccess) {
      throw new ForbiddenException('Нет доступа к новелле');
    }

    return novel;
  }

  async findByToken(token: string) {
    const novel = await this.prisma.novel.findUnique({
      where: { shareToken: token },
      include: {
        novelTags: {
          include: { tag: true }
        },
        novelAuthors: {
          include: { author: true }
        },
        chapters: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            volumeArk: true,
            order: true,
            createdAt: true,
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            avatarUrl: true,
            bio: true,
          }
        },
        _count: {
          select: { chapters: true }
        }
      },
    });

    if (!novel || !novel.isPublic) {
      throw new NotFoundException('Новелла не найдена или недоступна');
    }

    return novel;
  }

  async update(id: string, userId: string, dto: UpdateNovelDto) {
    const novel = await this.prisma.novel.findUnique({
      where: { id },
    });

    if (!novel) {
      throw new NotFoundException('Новелла не найдена');
    }

    if (novel.userId !== userId) {
      throw new ForbiddenException('Нет прав для редактирования');
    }

    const { tags, authors, ...updateData } = dto;

    // Update novel
    const updatedNovel = await this.prisma.novel.update({
      where: { id },
      data: updateData,
    });

    // Handle tags
    if (tags) {
      await this.prisma.novelTag.deleteMany({ where: { novelId: id } });
      if (tags.length > 0) {
        await this.handleTags(id, tags, userId);
      }
    }

    // Handle authors
    if (authors) {
      await this.prisma.novelAuthor.deleteMany({ where: { novelId: id } });
      if (authors.length > 0) {
        await this.handleAuthors(id, authors, userId);
      }
    }

    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string) {
    const novel = await this.prisma.novel.findUnique({
      where: { id },
    });

    if (!novel) {
      throw new NotFoundException('Новелла не найдена');
    }

    if (novel.userId !== userId) {
      throw new ForbiddenException('Нет прав для удаления');
    }

    await this.prisma.novel.delete({
      where: { id },
    });

    return { message: 'Новелла удалена' };
  }

  async generateShareToken(id: string, userId: string) {
    const novel = await this.prisma.novel.findUnique({
      where: { id },
    });

    if (!novel) {
      throw new NotFoundException('Новелла не найдена');
    }

    if (novel.userId !== userId) {
      throw new ForbiddenException('Нет прав для создания ссылки');
    }

    const shareToken = randomBytes(32).toString('hex');

    await this.prisma.novel.update({
      where: { id },
      data: {
        shareToken,
        isPublic: true,
      },
    });

    return { shareToken, shareUrl: `${process.env.FRONTEND_URL}/novels/${shareToken}` };
  }

  async revokeShareToken(id: string, userId: string) {
    const novel = await this.prisma.novel.findUnique({
      where: { id },
    });

    if (!novel) {
      throw new NotFoundException('Новелла не найдена');
    }

    if (novel.userId !== userId) {
      throw new ForbiddenException('Нет прав для отзыва ссылки');
    }

    await this.prisma.novel.update({
      where: { id },
      data: {
        shareToken: null,
        isPublic: false,
      },
    });

    return { message: 'Публичный доступ отключен' };
  }

  private async handleTags(novelId: string, tagNames: string[], userId: string) {
    for (const tagName of tagNames) {
      let tag = await this.prisma.tag.findUnique({
        where: { name: tagName },
      });

      if (!tag) {
        tag = await this.prisma.tag.create({
          data: { name: tagName, type: 'GENRE' },
        });
      }

      await this.prisma.novelTag.create({
        data: {
          novelId,
          tagId: tag.id,
        },
      });
    }
  }

  private async handleAuthors(novelId: string, authorNames: string[], userId: string) {
    for (const authorName of authorNames) {
      let author = await this.prisma.author.findUnique({
        where: { name: authorName },
      });

      if (!author) {
        author = await this.prisma.author.create({
          data: { name: authorName },
        });
      }

      await this.prisma.novelAuthor.create({
        data: {
          novelId,
          authorId: author.id,
          userId,
        },
      });
    }
  }
}
