import { IsString, IsOptional, IsArray, IsInt, IsEnum, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { NovelStatus } from '@prisma/client';

export class CreateNovelDto {
  @IsString()
  title: string;

  @IsString()
  originalTitle: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alternativeTitles?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(1800)
  @Max(2030)
  year?: number;

  @IsInt()
  @Min(1)
  chaptersInOriginal: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  wordCount?: number;

  @IsEnum(NovelStatus)
  originalStatus: NovelStatus;

  @IsEnum(NovelStatus)
  translationStatus: NovelStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  authors?: string[];
}

export class UpdateNovelDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  originalTitle?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alternativeTitles?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(1800)
  @Max(2030)
  year?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  chaptersInOriginal?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  wordCount?: number;

  @IsOptional()
  @IsEnum(NovelStatus)
  originalStatus?: NovelStatus;

  @IsOptional()
  @IsEnum(NovelStatus)
  translationStatus?: NovelStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  authors?: string[];
}

export class NovelFiltersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(NovelStatus, { each: true })
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  originalStatus?: NovelStatus[];

  @IsOptional()
  @IsArray()
  @IsEnum(NovelStatus, { each: true })
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  translationStatus?: NovelStatus[];

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @Transform(({ value }) => Array.isArray(value) ? value.map(Number) : [Number(value)])
  year?: [number, number];

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @Transform(({ value }) => Array.isArray(value) ? value.map(Number) : [Number(value)])
  wordCount?: [number, number];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  tags?: string[];

  @IsOptional()
  @IsString()
  sortBy?: 'title' | 'year';
}: true }
        }
      },
    });

    // Add to "Все" list
    const allList = await this.prisma.list.findFirst({
      where: { userId, name: 'Все' },
    });

    if (allList) {
      await this.prisma.listItem.create({
        data: {
          listId: allList.id,
          novelId: novel.id,
        },
      });
    }

    // Handle tags
    if (tags && tags.length > 0) {
      await this.handleTags(novel.id, tags, userId);
    }

    // Handle authors
    if (authors && authors.length > 0) {
      await this.handleAuthors(novel.id, authors, userId);
    }

    return this.findOne(novel.id, userId);
  }

  async findAll(userId: string, filters?: NovelFiltersDto) {
    const where: any = {
      OR: [
        { userId },
        { 
          AND: [
            { isPublic: true },
            { 
              listItems: {
                some: {
                  list: { userId }
                }
              }
            }
          ]
        }
      ]
    };

    // Apply filters
    if (filters) {
      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { originalTitle: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (filters.originalStatus) {
        where.originalStatus = { in: filters.originalStatus };
      }

      if (filters.translationStatus) {
        where.translationStatus = { in: filters.translationStatus };
      }

      if (filters.year) {
        where.year = { gte: filters.year[0], lte: filters.year[1] };
      }

      if (filters.wordCount) {
        where.wordCount = { gte: filters.wordCount[0], lte: filters.wordCount[1] };
      }

      if (filters.tags && filters.tags.length > 0) {
        where.novelTags = {
          some: {
            tagId: { in: filters.tags }
          }
        };
      }
    }

    const novels = await this.prisma.novel.findMany({
      where,
      include: {
        novelTags: {
          include: { tag: true }
        },
        novelAuthors: {
          include: { author: true }
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            avatarUrl: true,
          }
        },
        _count: {
          select: { chapters