import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateChapterDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  volumeArk?: string;

  @IsString()
  content: string;

  @IsString()
  novelId: string;
}

export class UpdateChapterDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  volumeArk?: string;

  @IsOptional()
  @IsString()
  content?: string;
}

export class ReorderChaptersDto {
  @IsArray()
  @IsString({ each: true })
  chapterIds: string[];
}