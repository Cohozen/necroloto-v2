import { Module } from '@nestjs/common';
import { BetsService } from './bets.service';
import { BetsController } from './bets.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { CelebritiesModule } from '../celebrities/celebrities.module';

@Module({
  imports: [PrismaModule, CelebritiesModule],
  providers: [BetsService],
  controllers: [BetsController],
  exports: [BetsService],
})
export class BetsModule {}
