import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNovelDto, UpdateNovelDto, NovelFiltersDto } from './dto';
import { randomBytes } from 'crypto';

@Injectable()
export class NovelsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateNovelDto) {
    const { tags, authors, ...novelData } = dto;

    return this.prisma.novel.create({
      data: {
        ...novelData,
        userId,
      },
      include: {
        novelTags: {
          include: { tag: true },
        },
        novelAuthors: {
          include: { author: true },
        },
        chapters: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { chapters: true },
        },
      },
    });
  }

  async findAll(userId: string, filters: NovelFiltersDto) {
    return this.prisma.novel.findMany({
      where: {
        userId,
        ...(filters.title && {
          title: {
            contains: filters.title,
            mode: 'insensitive',
          },
        }),
      },
      include: {
        novelTags: {
          include: { tag: true },
        },
        novelAuthors: {
          include: { author: true },
        },
        chapters: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { chapters: true },
        },
      },
      orderBy: filters?.sortBy === 'year' ? { year: 'desc' } : { title: 'asc' },
    });
  }

  async findOne(id: string, userId?: string) {
    const novel = await this.prisma.novel.findUnique({
      where: { id },
      include: {
        novelTags: {
          include: { tag: true },
        },
        novelAuthors: {
          include: { author: true },
        },
        chapters: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            volumeArk: true,
            order: true,
            createdAt: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            avatarUrl: true,
            bio: true,
          },
        },
        novelCoauthors: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
                bio: true,
              },
            },
          },
        },
        _count: {
          select: { chapters: true },
        },
      },
    });

    if (!novel) {
      throw new NotFoundException('Новелла не найдена');
    }

    const isCoauthor = novel.novelCoauthors.some(c => c.userId === userId);
    const hasAccess = !userId || novel.userId === userId || novel.isPublic || isCoauthor;
    if (!hasAccess) {
      throw new ForbiddenException('Нет доступа к новелле');
    }

    return {
      ...novel,
      coauthors: novel.novelCoauthors.map(c => c.user),
    };
  }

  async update(id: string, userId: string, updateNovelDto: UpdateNovelDto) {
    const novel = await this.prisma.novel.findUnique({
      where: { id },
      include: {
        novelCoauthors: true,
      },
    });

    if (!novel) {
      throw new NotFoundException('Новелла не найдена');
    }

    const isCoauthor = novel.novelCoauthors.some(c => c.userId === userId);
    const hasAccess = novel.userId === userId || isCoauthor;

    if (!hasAccess) {
      throw new ForbiddenException('Нет доступа к редактированию');
    }

    return this.prisma.novel.update({
      where: { id },
      data: updateNovelDto,
    });
  }

  async remove(id: string, userId: string) {
    const novel = await this.prisma.novel.findUnique({
      where: { id },
    });

    if (!novel || novel.userId !== userId) {
      throw new ForbiddenException('Нет доступа к удалению');
    }

    return this.prisma.novel.delete({ where: { id } });
  }

  async generateShareToken(id: string, userId: string) {
    const novel = await this.prisma.novel.findUnique({ where: { id } });
    if (!novel || novel.userId !== userId) {
      throw new ForbiddenException('Нет доступа к генерации ссылки');
    }

    const token = randomBytes(16).toString('hex');
    return this.prisma.novel.update({
      where: { id },
      data: {
        isPublic: true,
        shareToken: token,
      },
    });
  }

  async revokeShareToken(id: string, userId: string) {
    const novel = await this.prisma.novel.findUnique({ where: { id } });
    if (!novel || novel.userId !== userId) {
      throw new ForbiddenException('Нет доступа к отзыву ссылки');
    }

    return this.prisma.novel.update({
      where: { id },
      data: {
        isPublic: false,
        shareToken: null,
      },
    });
  }
}
