// Read-only inventory of a Postgres DB: lists public tables and row counts.
// Usage: node scripts/db-inventory.mjs <ENV_VAR_NAME>
//   e.g. node scripts/db-inventory.mjs NEON_DATABASE_URL
import 'dotenv/config';
import pg from 'pg';

const envVar = process.argv[2] ?? 'DATABASE_URL';
const connectionString = process.env[envVar];
if (!connectionString) {
  console.error(`Missing env var ${envVar}`);
  process.exit(1);
}

const client = new pg.Client({ connectionString });

const TABLES = [
  'User',
  'Celebrity',
  'Circle',
  'Bet',
  'CelebritiesOnBet',
  'Membership',
];

try {
  await client.connect();
  const { rows: serverRows } = await client.query('SHOW server_version');
  console.log(`[${envVar}] Postgres ${serverRows[0].server_version}`);

  // Which of our expected tables actually exist?
  const { rows: existing } = await client.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`,
  );
  const existingNames = new Set(existing.map((r) => r.table_name));
  console.log(
    `Public tables found: ${[...existingNames].sort().join(', ') || '(none)'}`,
  );

  for (const t of TABLES) {
    if (!existingNames.has(t)) {
      console.log(`  ${t.padEnd(18)} : (absent)`);
      continue;
    }
    const { rows } = await client.query(
      `SELECT COUNT(*)::int AS c FROM "${t}"`,
    );
    console.log(`  ${t.padEnd(18)} : ${rows[0].c}`);
  }
} catch (err) {
  console.error(`Connection/query error: ${err.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
