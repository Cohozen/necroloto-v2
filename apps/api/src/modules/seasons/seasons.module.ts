import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SeasonSchedulerService } from './season-scheduler.service';
import { SeasonsController } from './seasons.controller';
import { SeasonsService } from './seasons.service';

@Module({
    imports: [PrismaModule],
    providers: [SeasonsService, SeasonSchedulerService],
    controllers: [SeasonsController],
    exports: [SeasonsService],
})
export class SeasonsModule {}
