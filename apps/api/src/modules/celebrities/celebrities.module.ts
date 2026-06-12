import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { WikidataModule } from '../wikidata/wikidata.module';
import { CelebritiesController } from './celebrities.controller';
import { CelebritiesService } from './celebrities.service';

@Module({
    imports: [PrismaModule, StorageModule, WikidataModule],
    providers: [CelebritiesService],
    controllers: [CelebritiesController],
    exports: [CelebritiesService],
})
export class CelebritiesModule {}
