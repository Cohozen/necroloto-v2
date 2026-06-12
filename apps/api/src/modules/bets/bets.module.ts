import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CelebritiesModule } from '../celebrities/celebrities.module';
import { BetsController } from './bets.controller';
import { BetsService } from './bets.service';

@Module({
    imports: [PrismaModule, CelebritiesModule],
    providers: [BetsService],
    controllers: [BetsController],
    exports: [BetsService],
})
export class BetsModule {}
