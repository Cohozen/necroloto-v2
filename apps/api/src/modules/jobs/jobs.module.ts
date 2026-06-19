import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CelebritiesModule } from '../celebrities/celebrities.module';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

@Module({
    imports: [PrismaModule, CelebritiesModule],
    providers: [JobsService],
    controllers: [JobsController],
    exports: [JobsService],
})
export class JobsModule {}
