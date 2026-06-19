// Integration check of the async job runner against the real local DB + Wikidata.
// Boots a Nest application context (no HTTP, no auth) and drives JobsService
// directly. Creates throwaway celebrities + jobs and deletes them afterwards.
import 'reflect-metadata';
import 'dotenv/config';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/src/app.module.js');
const { JobsService } = require('../dist/src/modules/jobs/jobs.service.js');
const { CelebritiesService } = require('../dist/src/modules/celebrities/celebrities.service.js');
const { PrismaService } = require('../dist/src/prisma/prisma.service.js');

const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
const prisma = app.get(PrismaService);
const jobs = app.get(JobsService);
const celebrities = app.get(CelebritiesService);

let failures = 0;
const ok = (cond, label) => {
    console.log(`  ${cond ? '✅' : '❌'} ${label}`);
    if (!cond) failures++;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const created = [];
const createdJobs = [];

try {
    console.log('\n[1] Bulk enrich job (real Wikidata)');
    // Deceased public figures with solid Wikidata coverage. No death stored yet,
    // so a successful enrich must fill birth + death.
    for (const name of ['Johnny Hallyday', 'Charles Aznavour']) {
        const c = await celebrities.create({ name });
        created.push(c.id);
    }

    const job = await jobs.enqueueBulkEnrich(created);
    createdJobs.push(job.id);
    ok(job.status === 'PENDING', `enqueue returns immediately (status ${job.status})`);
    ok(job.total === 2, `total = ${job.total} (expected 2)`);

    // Poll until terminal (worker runs in-process).
    let polled = job;
    for (let i = 0; i < 40; i++) {
        await sleep(750);
        polled = await prisma.syncJob.findUnique({ where: { id: job.id } });
        if (polled.status === 'SUCCEEDED' || polled.status === 'FAILED') break;
    }
    console.log(
        `    -> status=${polled.status} processed=${polled.processed} ` +
            `succeeded=${polled.succeeded} failed=${polled.failed}`,
    );
    ok(polled.status === 'SUCCEEDED', 'job reached SUCCEEDED');
    ok(polled.processed === 2, `processed = ${polled.processed} (expected 2)`);

    const enriched = await prisma.celebrity.findMany({ where: { id: { in: created } } });
    const allLinked = enriched.every((c) => c.wikidataId && c.birth && c.death);
    ok(allLinked, 'both celebrities got wikidataId + birth + death from Wikidata');

    console.log('\n[2] Death scan recording (recordDeathScan)');
    const fakeSummary = {
        checked: 5,
        newDeaths: [{ id: 'x', name: 'Test', death: '2026-01-01' }],
    };
    const result = await jobs.recordDeathScan(async () => fakeSummary);
    ok(result.checked === 5, 'recordDeathScan returns the inner result unchanged');
    const scanJob = await prisma.syncJob.findFirst({
        where: { type: 'DEATH_SCAN' },
        orderBy: { createdAt: 'desc' },
    });
    createdJobs.push(scanJob.id);
    ok(scanJob.status === 'SUCCEEDED', `death-scan job status = ${scanJob.status}`);
    ok(scanJob.total === 5 && scanJob.succeeded === 1, 'death-scan counters (checked/newDeaths) stored');

    console.log('\n[3] findRecent / findOne');
    const recent = await jobs.findRecent(5);
    ok(Array.isArray(recent) && recent.length >= 2, `findRecent returns ${recent.length} job(s)`);
    const one = await jobs.findOne(job.id);
    ok(one?.id === job.id, 'findOne returns the bulk-enrich job');
} catch (e) {
    console.error('\n💥 Unexpected error:', e);
    failures++;
} finally {
    // Cleanup throwaway rows.
    if (createdJobs.length) {
        await prisma.syncJob.deleteMany({ where: { id: { in: createdJobs } } });
    }
    if (created.length) {
        await prisma.celebritiesOnBet.deleteMany({ where: { celebrityId: { in: created } } });
        await prisma.celebrity.deleteMany({ where: { id: { in: created } } });
    }
    await app.close();
    console.log(`\n${failures === 0 ? '✅ All checks passed' : `❌ ${failures} check(s) failed`}`);
    process.exit(failures === 0 ? 0 : 1);
}
