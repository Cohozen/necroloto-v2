// Verifies the daily death-detection automation against the real DB + Wikidata.
// Sets up a tracked-but-alive celebrity linked to a deceased Wikidata entity,
// runs detection, checks the death is recorded (and idempotent), then cleans up.
import 'reflect-metadata';
import 'dotenv/config';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/src/app.module.js');
const {
    DeathDetectionService,
} = require('../dist/src/modules/automation/death-detection.service.js');
const { PrismaService } = require('../dist/src/prisma/prisma.service.js');

const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
const prisma = app.get(PrismaService);
const detection = app.get(DeathDetectionService);

let failures = 0;
const ok = (cond, label) => {
    console.log(`  ${cond ? '✅' : '❌'} ${label}`);
    if (!cond) failures++;
};

let created;
try {
    // Tracked (wikidataId set) but not yet recorded as dead.
    await prisma.celebrity.deleteMany({ where: { wikidataId: 'Q212015' } });
    created = await prisma.celebrity.create({
        data: { name: 'Test Death Detect', wikidataId: 'Q212015', death: null },
    });

    console.log('\n[run] death detection');
    const result = await detection.run();
    const found = result.newDeaths.find((d) => d.id === created.id);
    ok(!!found, 'detected the new death');
    ok(found?.death === '2017-12-05', `recorded correct death date (${found?.death})`);

    const after = await prisma.celebrity.findUnique({ where: { id: created.id } });
    ok(after?.death?.toISOString().slice(0, 10) === '2017-12-05', 'celebrity.death persisted');

    console.log('[run] again (idempotency)');
    const second = await detection.run();
    ok(!second.newDeaths.some((d) => d.id === created.id), 'no duplicate detection on re-run');

    console.log(failures === 0 ? '\n✅ Death detection OK' : `\n❌ ${failures} failed`);
    process.exitCode = failures === 0 ? 0 : 1;
} catch (err) {
    console.error('Death detection verify error:', err.message);
    process.exitCode = 1;
} finally {
    if (created) {
        await prisma.celebritiesOnBet.deleteMany({ where: { celebrityId: created.id } });
        await prisma.celebrity.delete({ where: { id: created.id } }).catch(() => {});
        console.log('     cleaned up throwaway celebrity');
    }
    await app.close();
}
