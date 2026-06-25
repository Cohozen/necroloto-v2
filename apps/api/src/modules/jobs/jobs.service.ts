import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { Prisma, type SyncJobType } from '@/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CelebritiesService } from '../celebrities/celebrities.service';
import { Semaphore } from './semaphore';

/** Summary returned by a death scan, persisted into the job's `result`. */
export interface DeathScanSummary {
    checked: number;
    newDeaths: { id: string; name: string; death: string }[];
}

/**
 * In-process background job runner. Persists each job to `SyncJob` so the admin
 * can follow progress and history. A single global semaphore bounds the number
 * of concurrent Wikidata calls across *all* jobs, so launching several at once
 * never hammers the public API.
 *
 * Trade-off (no queue infra): a job left RUNNING when the process restarts is
 * reconciled to FAILED on the next boot (see `onApplicationBootstrap`).
 */
@Injectable()
export class JobsService implements OnApplicationBootstrap {
    private readonly logger = new Logger('Jobs');
    /**
     * Global cap on parallel Wikidata enrich calls, shared by every job. Kept low
     * (each enrich fans out into several Wikidata requests) so bulk syncs stay under
     * Wikidata's per-IP rate limit; `WikidataService` also backs off on 429.
     */
    private readonly wikidata = new Semaphore(2);

    constructor(
        private prisma: PrismaService,
        private celebrities: CelebritiesService,
    ) {}

    /** Reconcile jobs orphaned by a process restart (the in-process trade-off). */
    async onApplicationBootstrap(): Promise<void> {
        const { count } = await this.prisma.syncJob.updateMany({
            where: { status: { in: ['PENDING', 'RUNNING'] } },
            data: {
                status: 'FAILED',
                error: 'Interrompu par un redémarrage du serveur',
                finishedAt: new Date(),
            },
        });
        if (count > 0) this.logger.warn(`Reconciled ${count} orphaned job(s) to FAILED.`);
    }

    findOne(id: string) {
        return this.prisma.syncJob.findUnique({ where: { id } });
    }

    findRecent(limit: number, type?: SyncJobType) {
        return this.prisma.syncJob.findMany({
            where: type ? { type } : undefined,
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    /**
     * Creates a bulk-enrich job and kicks off processing in the background.
     * Returns immediately so the HTTP request doesn't wait for the network work.
     */
    async enqueueBulkEnrich(ids: string[]) {
        const job = await this.prisma.syncJob.create({
            data: {
                type: 'WIKIDATA_BULK_ENRICH',
                total: ids.length,
                payload: { celebrityIds: ids },
            },
        });
        // Fire-and-forget: the worker runs after we return. Errors are captured
        // onto the job row, so a rejection here must never bubble unhandled.
        void this.runBulkEnrich(job.id, ids);
        return job;
    }

    /** Processes a bulk-enrich job, updating progress counters as items settle. */
    private async runBulkEnrich(jobId: string, ids: string[]): Promise<void> {
        await this.prisma.syncJob.update({
            where: { id: jobId },
            data: { status: 'RUNNING', startedAt: new Date() },
        });

        const errors: { id: string; error: string }[] = [];
        let processed = 0;
        let succeeded = 0;
        let failed = 0;

        try {
            await Promise.all(
                ids.map((id) =>
                    this.wikidata.run(async () => {
                        try {
                            await this.celebrities.enrich(id);
                            succeeded++;
                        } catch (e) {
                            failed++;
                            errors.push({
                                id,
                                error:
                                    e instanceof Error ? e.message : 'Échec de la synchronisation',
                            });
                        }
                        processed++;
                        // Persist progress as items finish so the front can poll.
                        await this.prisma.syncJob
                            .update({
                                where: { id: jobId },
                                data: { processed, succeeded, failed },
                            })
                            .catch(() => undefined);
                    }),
                ),
            );

            await this.prisma.syncJob.update({
                where: { id: jobId },
                data: {
                    status: 'SUCCEEDED',
                    processed,
                    succeeded,
                    failed,
                    result: { errors },
                    finishedAt: new Date(),
                },
            });
        } catch (e) {
            this.logger.error(`Bulk enrich job ${jobId} crashed: ${e}`);
            await this.prisma.syncJob
                .update({
                    where: { id: jobId },
                    data: {
                        status: 'FAILED',
                        error: e instanceof Error ? e.message : 'Erreur inconnue',
                        result: { errors },
                        finishedAt: new Date(),
                    },
                })
                .catch(() => undefined);
        }
    }

    /**
     * Records a death scan run as a job (history/observability) around the
     * caller's detection logic, which stays the single source of truth.
     */
    async recordDeathScan(run: () => Promise<DeathScanSummary>): Promise<DeathScanSummary> {
        const job = await this.prisma.syncJob.create({
            data: { type: 'DEATH_SCAN', status: 'RUNNING', startedAt: new Date() },
        });
        try {
            const summary = await run();
            await this.prisma.syncJob.update({
                where: { id: job.id },
                data: {
                    status: 'SUCCEEDED',
                    total: summary.checked,
                    processed: summary.checked,
                    succeeded: summary.newDeaths.length,
                    result: summary as unknown as Prisma.InputJsonValue,
                    finishedAt: new Date(),
                },
            });
            return summary;
        } catch (e) {
            await this.prisma.syncJob
                .update({
                    where: { id: job.id },
                    data: {
                        status: 'FAILED',
                        error: e instanceof Error ? e.message : 'Erreur inconnue',
                        finishedAt: new Date(),
                    },
                })
                .catch(() => undefined);
            throw e;
        }
    }
}
