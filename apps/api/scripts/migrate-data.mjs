// Copies all Necroloto data from the source DB (Neon) to the target DB (Supabase).
// Read-only on the source; truncates + repopulates the target (idempotent).
//
//   source = NEON_DATABASE_URL
//   target = DATABASE_URL (Supabase transaction pooler)
//
// Usage: node scripts/migrate-data.mjs [--dry-run]
import 'dotenv/config';
import pg from 'pg';

// Preserve date/timestamp values verbatim (as text) to avoid any timezone shift
// when round-tripping through JS Date objects.
pg.types.setTypeParser(1082, (v) => v); // date
pg.types.setTypeParser(1114, (v) => v); // timestamp (no tz)
pg.types.setTypeParser(1184, (v) => v); // timestamptz

const DRY_RUN = process.argv.includes('--dry-run');

// Tables in foreign-key-safe insert order.
const ORDER = ['User', 'Celebrity', 'Circle', 'Bet', 'CelebritiesOnBet', 'Membership'];

const source = new pg.Client({
    connectionString: process.env.NEON_DATABASE_URL,
});
const target = new pg.Client({ connectionString: process.env.DATABASE_URL });

const CHUNK = 100;

function buildInsert(table, cols, rows) {
    const colSql = cols.map((c) => `"${c}"`).join(', ');
    const params = [];
    const tuples = rows.map((row) => {
        const ph = cols.map((c) => {
            params.push(row[c] ?? null);
            return `$${params.length}`;
        });
        return `(${ph.join(', ')})`;
    });
    return {
        text: `INSERT INTO "${table}" (${colSql}) VALUES ${tuples.join(', ')}`,
        values: params,
    };
}

try {
    await source.connect();
    await target.connect();

    // Wipe target (reverse FK order) so the script is safely re-runnable.
    if (!DRY_RUN) {
        await target.query(
            `TRUNCATE ${ORDER.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE`,
        );
    }

    const summary = [];
    for (const table of ORDER) {
        const res = await source.query(`SELECT * FROM "${table}"`);
        const cols = res.fields.map((f) => f.name);
        const rows = res.rows;

        if (!DRY_RUN && rows.length > 0) {
            for (let i = 0; i < rows.length; i += CHUNK) {
                const chunk = rows.slice(i, i + CHUNK);
                const { text, values } = buildInsert(table, cols, chunk);
                await target.query(text, values);
            }
        }

        // Verify count on target
        let targetCount = 0;
        if (!DRY_RUN) {
            const c = await target.query(`SELECT COUNT(*)::int AS c FROM "${table}"`);
            targetCount = c.rows[0].c;
        }
        summary.push({ table, source: rows.length, target: targetCount });
        console.log(
            `  ${table.padEnd(18)} source=${String(rows.length).padStart(5)}  target=${String(
                targetCount,
            ).padStart(
                5,
            )}  ${!DRY_RUN && rows.length === targetCount ? 'OK' : DRY_RUN ? '(dry-run)' : 'MISMATCH'}`,
        );
    }

    const mismatch = !DRY_RUN && summary.some((s) => s.source !== s.target);
    console.log(mismatch ? '\n❌ Parité NON respectée' : '\n✅ Parité OK');
    process.exitCode = mismatch ? 1 : 0;
} catch (err) {
    console.error(`Migration error: ${err.message}`);
    process.exitCode = 1;
} finally {
    await source.end();
    await target.end();
}
