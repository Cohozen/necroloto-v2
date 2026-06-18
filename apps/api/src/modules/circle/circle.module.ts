import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { BetsModule } from '../bets/bets.module';
import { SeasonsModule } from '../seasons/seasons.module';
import { CircleController } from './circle.controller';
import { CircleService } from './circle.service';

@Module({
    imports: [PrismaModule, BetsModule, SeasonsModule],
    providers: [CircleService],
    controllers: [CircleController],
    exports: [CircleService],
})
export class CircleModule {}
