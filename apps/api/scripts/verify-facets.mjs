// Verifies the celebrity-facets feature end-to-end against the real local DB +
// Wikidata: enriches a sample of existing linked celebrities (filling the new
// nationality/gender/category columns), then checks findFacets + facet filtering.
// Run after `pnpm --filter necroloto-api build`:  node scripts/verify-facets.mjs
import 'reflect-metadata';
import 'dotenv/config';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/src/app.module.js');
const { CelebritiesService } = require('../dist/src/modules/celebrities/celebrities.service.js');
const { PrismaService } = require('../dist/src/prisma/prisma.service.js');

const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
const prisma = app.get(PrismaService);
const celebrities = app.get(CelebritiesService);

const SAMPLE = 18;

try {
    const linked = await prisma.celebrity.findMany({
        where: { wikidataId: { not: null }, death: null },
        orderBy: { name: 'asc' },
        take: SAMPLE,
        select: { id: true, name: true },
    });
    console.log(`Enriching ${linked.length} linked celebrities from Wikidata…`);
    for (const c of linked) {
        try {
            const e = await celebrities.enrich(c.id);
            console.log(
                `  ${c.name} → cat=${e.category ?? '∅'} | nat=${e.nationality ?? '∅'} | gender=${e.gender ?? '∅'}`,
            );
        } catch (err) {
            console.log(`  ${c.name} → enrich failed: ${err.message}`);
        }
    }

    const facets = await celebrities.findFacets();
    console.log('\nfindFacets():');
    console.log('  categories   :', facets.categories);
    console.log('  nationalities:', facets.nationalities);

    if (facets.categories[0]) {
        const cat = facets.categories[0];
        const page = await celebrities.findCataloguePage({ category: cat, take: 50, skip: 0 });
        const allMatch = page.items.every((i) => i.category === cat);
        console.log(`\nfindCataloguePage({category:"${cat}"}): ${page.total} rows, allMatch=${allMatch}`);
    }

    // Age filter sanity: 60+ should only return birthdays ≤ (currentYear-60).
    const old = await celebrities.findCataloguePage({ ageMin: 60, take: 50, skip: 0 });
    const cutoff = new Date().getUTCFullYear() - 60;
    const ageOk = old.items.every((i) => i.birth && new Date(i.birth).getUTCFullYear() <= cutoff);
    console.log(`findCataloguePage({ageMin:60}): ${old.total} rows, all born ≤ ${cutoff}: ${ageOk}`);
} catch (err) {
    console.error('verify-facets error:', err);
    process.exitCode = 1;
} finally {
    await app.close();
}
