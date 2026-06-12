import { Module } from '@nestjs/common';
import { CelebritiesService } from './celebrities.service';
import { CelebritiesController } from './celebrities.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CelebritiesService],
  controllers: [CelebritiesController],
  exports: [CelebritiesService],
})
export class CelebritiesModule {}
