// Deeper parity check between Neon (source) and Supabase (target):
// compares aggregates that would reveal date drift or value corruption.
import 'dotenv/config';
import pg from 'pg';

pg.types.setTypeParser(1082, (v) => v);
pg.types.setTypeParser(1114, (v) => v);
pg.types.setTypeParser(1184, (v) => v);

const source = new pg.Client({
    connectionString: process.env.NEON_DATABASE_URL,
});
const target = new pg.Client({ connectionString: process.env.DATABASE_URL });

const CHECKS = [
    ['Celebrities with birth', `SELECT COUNT(*)::int c FROM "Celebrity" WHERE birth IS NOT NULL`],
    ['Celebrities with death', `SELECT COUNT(*)::int c FROM "Celebrity" WHERE death IS NOT NULL`],
    ['Min birth date', `SELECT MIN(birth)::text v FROM "Celebrity"`],
    ['Max death date', `SELECT MAX(death)::text v FROM "Celebrity"`],
    ['Sum of all points', `SELECT COALESCE(SUM(points),0)::text v FROM "CelebritiesOnBet"`],
    [
        'Distinct bet years',
        `SELECT string_agg(DISTINCT year::text, ',' ORDER BY year::text) v FROM "Bet"`,
    ],
    [
        'Sample celeb (by id order)',
        `SELECT name || '|' || COALESCE(birth::text,'-') || '|' || COALESCE(death::text,'-') v FROM "Celebrity" ORDER BY id LIMIT 1`,
    ],
    [
        'Membership roles',
        `SELECT string_agg(role::text, ',' ORDER BY role::text) v FROM "Membership"`,
    ],
];

try {
    await source.connect();
    await target.connect();
    let allOk = true;
    for (const [label, sql] of CHECKS) {
        const s = await source.query(sql);
        const t = await target.query(sql);
        const sv = JSON.stringify(Object.values(s.rows[0])[0]);
        const tv = JSON.stringify(Object.values(t.rows[0])[0]);
        const ok = sv === tv;
        if (!ok) allOk = false;
        console.log(`  ${ok ? '✅' : '❌'} ${label.padEnd(28)} neon=${sv}  supa=${tv}`);
    }
    console.log(allOk ? '\n✅ Toutes les vérifications passent' : '\n❌ Divergence détectée');
    process.exitCode = allOk ? 0 : 1;
} finally {
    await source.end();
    await target.end();
}
