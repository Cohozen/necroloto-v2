// Probes candidate Supabase pooler hosts using the credentials already in
// DATABASE_URL, without ever printing the password.
import 'dotenv/config';
import pg from 'pg';

const base = process.env.DATABASE_URL;
if (!base) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}

const u = new URL(base);
const candidates = [
  'aws-0-eu-west-3.pooler.supabase.com',
  'aws-1-eu-west-3.pooler.supabase.com',
  'db.teqvyzkwfdewkklculpf.supabase.co', // direct (IPv6, may be unreachable locally)
];

for (const host of candidates) {
  for (const port of host.startsWith('db.') ? [5432] : [6543]) {
    const url = new URL(base);
    url.host = `${host}:${port}`;
    const client = new pg.Client({
      connectionString: url.toString(),
      connectionTimeoutMillis: 8000,
    });
    try {
      await client.connect();
      const { rows } = await client.query('SELECT 1 AS ok');
      console.log(`OK   ${host}:${port}  -> query ok=${rows[0].ok}`);
      await client.end();
    } catch (err) {
      console.log(`FAIL ${host}:${port}  -> ${err.code ?? ''} ${err.message}`);
      try { await client.end(); } catch {}
    }
  }
}
