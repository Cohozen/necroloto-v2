import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { CelebritiesService } from '../celebrities/celebrities.service';
import { JobsService } from '../jobs/jobs.service';
import { type CelebrityDiedEvent, NotificationEvents } from '../notifications/events';
import { WikidataService } from '../wikidata/wikidata.service';

export interface DetectedDeath {
    id: string;
    name: string;
    death: string;
}
export interface DeathDetectionResult {
    checked: number;
    newDeaths: DetectedDeath[];
}

/**
 * The core automation: each day, look up every tracked-but-alive celebrity on
 * Wikidata and, when a death date appears, record it and rescore. This removes
 * the admin's need to manually watch for deaths.
 *
 * A celebrity is "tracked" once it has a `wikidataId` (set by enrichment).
 */
@Injectable()
export class DeathDetectionService {
    private readonly logger = new Logger('DeathDetection');

    constructor(
        private prisma: PrismaService,
        private wikidata: WikidataService,
        private celebrities: CelebritiesService,
        private jobs: JobsService,
        private events: EventEmitter2,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_4AM)
    async scheduled(): Promise<void> {
        const { checked, newDeaths } = await this.scan();
        this.logger.log(`Daily death check: ${checked} tracked, ${newDeaths.length} new death(s).`);
    }

    /**
     * Runs the death detection and records it as a `SyncJob` (observable
     * history). Used by both the daily cron and the manual admin trigger.
     */
    scan(): Promise<DeathDetectionResult> {
        return this.jobs.recordDeathScan(() => this.run());
    }

    /**
     * Checks all tracked-but-alive celebrities and records any newly found death.
     * Idempotent: already-recorded deaths are skipped. Returns a run summary.
     */
    async run(): Promise<DeathDetectionResult> {
        const tracked = await this.prisma.celebrity.findMany({
            where: { wikidataId: { not: null }, death: null },
        });
        if (tracked.length === 0) return { checked: 0, newDeaths: [] };

        const byQid = new Map(tracked.map((c) => [c.wikidataId as string, c]));
        const summaries = await this.wikidata.getEntities([...byQid.keys()]);

        const newDeaths: DetectedDeath[] = [];
        for (const summary of summaries) {
            if (!summary.death) continue;
            const celebrity = byQid.get(summary.wikidataId);
            if (!celebrity || celebrity.death) continue;

            await this.prisma.celebrity.update({
                where: { id: celebrity.id },
                data: { death: summary.death },
            });
            await this.celebrities.recalculatePoints(celebrity.id);

            this.events.emit(NotificationEvents.CelebrityDied, {
                celebrityId: celebrity.id,
                deathYear: summary.death.getUTCFullYear(),
            } satisfies CelebrityDiedEvent);

            const death = summary.death.toISOString().slice(0, 10);
            this.logger.log(`Detected death: ${celebrity.name} (${death})`);
            newDeaths.push({ id: celebrity.id, name: celebrity.name, death });
        }

        return { checked: tracked.length, newDeaths };
    }
}
