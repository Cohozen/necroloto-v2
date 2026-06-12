// Verifies WikidataService against the live Wikidata API (read-only).
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { WikidataService } = require('../dist/src/modules/wikidata/wikidata.service.js');

const wd = new WikidataService();
let failures = 0;
const ok = (cond, label) => {
    console.log(`  ${cond ? '✅' : '❌'} ${label}`);
    if (!cond) failures++;
};

try {
    // A well-known deceased person (Johnny Hallyday, d. 2017).
    console.log('\n[search] "Johnny Hallyday"');
    const results = await wd.searchByName('Johnny Hallyday', 5);
    const johnny = results.find((r) => r.isHuman && r.death);
    console.log(
        `     top: ${results[0]?.label} (${results[0]?.wikidataId}) — ${results[0]?.description ?? ''}`,
    );
    ok(results.length > 0, 'returns candidates');
    ok(!!johnny, 'finds a deceased human match');
    if (johnny) {
        console.log(
            `     ${johnny.label} ${johnny.wikidataId} birth=${johnny.birth?.toISOString().slice(0, 10)} death=${johnny.death?.toISOString().slice(0, 10)} photo=${johnny.photoFilename ? 'yes' : 'no'}`,
        );
        ok(johnny.birth instanceof Date, 'has a birth date');
        ok(johnny.death instanceof Date, 'has a death date');
        ok(johnny.death.getUTCFullYear() === 2017, 'death year is 2017');
        ok(!!johnny.photoFilename, 'has a Commons photo');
        const url = wd.photoUrl(johnny.photoFilename);
        const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
        ok(res.ok, `photo URL reachable (HTTP ${res.status})`);
    }

    // A living person should have no death date.
    console.log('\n[entity] living person (Q317521, Elon Musk)');
    const musk = await wd.getEntity('Q317521');
    console.log(`     ${musk?.label} death=${musk?.death ?? 'none'}`);
    ok(musk?.isHuman === true, 'is human');
    ok(musk?.death === undefined, 'no death date for a living person');

    // Time parsing edge cases.
    ok(
        wd.parseWikidataTime('+2017-12-05T00:00:00Z')?.getUTCFullYear() === 2017,
        'parses day-precision time',
    );
    ok(
        wd.parseWikidataTime('+1943-00-00T00:00:00Z')?.getUTCFullYear() === 1943,
        'parses year-only time (month/day 00)',
    );

    console.log(failures === 0 ? '\n✅ Wikidata OK' : `\n❌ ${failures} failed`);
    process.exitCode = failures === 0 ? 0 : 1;
} catch (err) {
    console.error('Wikidata verify error:', err.message);
    process.exitCode = 1;
}
