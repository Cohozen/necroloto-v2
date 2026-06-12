import { Module } from '@nestjs/common';
import { CelebritiesService } from './celebrities.service';
import { CelebritiesController } from './celebrities.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [PrismaModule, StorageModule],
  providers: [CelebritiesService],
  controllers: [CelebritiesController],
  exports: [CelebritiesService],
})
export class CelebritiesModule {}
