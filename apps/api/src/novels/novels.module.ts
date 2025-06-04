import { Module } from '@nestjs/common';
import { NovelsController } from './novels.controller';
import { NovelsService } from './novels.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [NovelsController],
  providers: [NovelsService, PrismaService],
  exports: [NovelsService],
})
export class NovelsModule {}