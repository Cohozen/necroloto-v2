import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { BetsModule } from '../bets/bets.module';
import { CircleController } from './circle.controller';
import { CircleService } from './circle.service';

@Module({
    imports: [PrismaModule, BetsModule],
    providers: [CircleService],
    controllers: [CircleController],
    exports: [CircleService],
})
export class CircleModule {}
