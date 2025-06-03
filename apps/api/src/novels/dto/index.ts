import { NovelStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export enum Orientation {
  ROMANCE = 'Романтика',
  PURE_LOVE = 'Чистая любовь',
  YURI = 'Лили',
  NO_CP = 'Без CP',
}

export enum Perspective {
  PROTAGONIST_MALE = 'Главный герой',
  PROTAGONIST_FEMALE = 'Главная героиня',
  GONG = 'Гг-гун',
  SHOU = 'Гг-шоу',
  UNKNOWN = 'Неизвестно',
}

export enum Era {
  ALT_HISTORY = 'Альтернативная история',
  MODERN = 'Современность',
  FUTURE = 'Будущее',
}

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
  @IsNumber()
  @Min(0)
  year?: number;

  @IsNumber()
  @Min(1)
  chaptersInOriginal: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  wordCount?: number; // количество слов в оригинале

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

  @IsOptional()
  @IsEnum(Orientation)
  orientation?: Orientation;

  @IsOptional()
  @IsEnum(Perspective)
  perspective?: Perspective;

  @IsOptional()
  @IsEnum(Era)
  era?: Era;
}

export class NovelFiltersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(NovelStatus, { each: true })
  originalStatus?: NovelStatus[];

  @IsOptional()
  @IsArray()
  @IsEnum(NovelStatus, { each: true })
  translationStatus?: NovelStatus[];

  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value.map(Number) : [Number(value)])
  @IsArray()
  @IsNumber({}, { each: true })
  year?: number[];

  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value.map(Number) : [Number(value)])
  @IsArray()
  @IsNumber({}, { each: true })
  wordCount?: number[]; // Кол-во слов

  @IsOptional()
  @IsEnum(Orientation, { each: true })
  orientation?: Orientation[];

  @IsOptional()
  @IsEnum(Perspective, { each: true })
  perspective?: Perspective[];

  @IsOptional()
  @IsEnum(Era, { each: true })
  era?: Era[];

  @IsOptional()
  @IsString()
  sortBy?: 'title' | 'year';
}
