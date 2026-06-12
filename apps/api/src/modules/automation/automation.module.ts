import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CelebritiesModule } from '../celebrities/celebrities.module';
import { WikidataModule } from '../wikidata/wikidata.module';
import { AutomationController } from './automation.controller';
import { DeathDetectionService } from './death-detection.service';

@Module({
    imports: [PrismaModule, WikidataModule, CelebritiesModule],
    providers: [DeathDetectionService],
    controllers: [AutomationController],
    exports: [DeathDetectionService],
})
export class AutomationModule {}
