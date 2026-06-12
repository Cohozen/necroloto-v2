// Verifies celebrity enrichment from Wikidata against the real DB + Wikidata +
// Supabase Storage. Creates a throwaway celebrity, enriches it, then cleans up.
import 'reflect-metadata';
import 'dotenv/config';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/src/app.module.js');
const { CelebritiesService } = require('../dist/src/modules/celebrities/celebrities.service.js');
const { StorageService } = require('../dist/src/modules/storage/storage.service.js');
const { PrismaService } = require('../dist/src/prisma/prisma.service.js');

const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
const prisma = app.get(PrismaService);
const celebrities = app.get(CelebritiesService);
const storage = app.get(StorageService);

let failures = 0;
const ok = (cond, label) => {
    console.log(`  ${cond ? '✅' : '❌'} ${label}`);
    if (!cond) failures++;
};

let created;
try {
    // Avoid colliding with the wikidataId unique index from a previous run.
    await prisma.celebrity.deleteMany({ where: { wikidataId: 'Q212015' } });

    created = await prisma.celebrity.create({
        data: { name: 'Test Wikidata Johnny' },
    });
    console.log('\n[enrich] explicit Q-id Q212015 (Johnny Hallyday)');
    const enriched = await celebrities.enrich(created.id, 'Q212015');

    ok(enriched.wikidataId === 'Q212015', 'wikidataId linked');
    ok(
        enriched.birth?.toISOString().slice(0, 10) === '1943-06-15',
        `birth filled (${enriched.birth?.toISOString().slice(0, 10)})`,
    );
    ok(
        enriched.death?.toISOString().slice(0, 10) === '2017-12-05',
        `death filled (${enriched.death?.toISOString().slice(0, 10)})`,
    );
    ok(!!enriched.photo, `photo set (${enriched.photo?.slice(0, 60)}...)`);
    if (enriched.photo) {
        const res = await fetch(enriched.photo.split('?')[0], { redirect: 'follow' });
        ok(res.ok, `photo URL reachable (HTTP ${res.status})`);
    }

    console.log(failures === 0 ? '\n✅ Enrich OK' : `\n❌ ${failures} failed`);
    process.exitCode = failures === 0 ? 0 : 1;
} catch (err) {
    console.error('Enrich verify error:', err.message);
    process.exitCode = 1;
} finally {
    if (created) {
        await storage.deleteImage(`celebrities/${created.id}`);
        await prisma.celebrity.delete({ where: { id: created.id } }).catch(() => {});
        console.log('     cleaned up throwaway celebrity + photo');
    }
    await app.close();
}
