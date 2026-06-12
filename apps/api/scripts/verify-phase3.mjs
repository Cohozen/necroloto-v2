// Integration check of Phase 3 logic against the real Supabase DB.
// Boots a Nest application context (no HTTP, no auth guard) and exercises the
// services directly. Read-only except for a throwaway bet it creates & deletes.
import 'reflect-metadata';
import 'dotenv/config';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/src/app.module.js');
const { BetsService } = require('../dist/src/modules/bets/bets.service.js');
const {
  CelebritiesService,
} = require('../dist/src/modules/celebrities/celebrities.service.js');
const { PrismaService } = require('../dist/src/prisma/prisma.service.js');
const { calculPointByCelebrity, deathYear } = require('@necroloto/shared');

const app = await NestFactory.createApplicationContext(AppModule, {
  logger: false,
});
const prisma = app.get(PrismaService);
const bets = app.get(BetsService);
const celebrities = app.get(CelebritiesService);

let failures = 0;
const ok = (cond, label) => {
  console.log(`  ${cond ? '✅' : '❌'} ${label}`);
  if (!cond) failures++;
};

try {
  // 1) Scoring parity: every stored point must equal the shared rule applied to
  //    the migrated data (bet must target the death year to score).
  console.log('\n[1] Scoring parity on migrated data');
  const links = await prisma.celebritiesOnBet.findMany({
    include: { celebrity: true, bet: true },
  });
  let scored = 0;
  let mismatches = 0;
  for (const l of links) {
    const { birth, death } = l.celebrity;
    let expected = 0;
    if (birth && death) {
      expected =
        l.bet.year === deathYear(death) ? calculPointByCelebrity(birth, death) : 0;
    }
    if (expected !== 0) scored++;
    if (expected !== l.points) {
      mismatches++;
      if (mismatches <= 5) {
        console.log(
          `     mismatch: "${l.celebrity.name}" betYear=${l.bet.year} stored=${l.points} expected=${expected}`,
        );
      }
    }
  }
  console.log(`     ${links.length} links, ${scored} expected to score`);
  ok(mismatches === 0, `stored points match the scoring rule (${mismatches} mismatches)`);

  // 2) Ranking on the real circle / year.
  console.log('\n[2] Leaderboard (real circle, year 2026)');
  const circle = await prisma.circle.findFirst();
  const ranked = await bets.rankByYearAndCircle(circle.id, 2026, 'points');
  ranked
    .slice(0, 5)
    .forEach((r) =>
      console.log(
        `     #${r.rank} ${(r.user?.username ?? r.userId).padEnd(20)} total=${r.total} deaths=${r.deathCount}`,
      ),
    );
  // rank monotonic & starts at 1
  ok(ranked.length === 0 || ranked[0].rank === 1, 'first rank is 1');
  ok(
    ranked.every((r, i) => i === 0 || r.rank >= ranked[i - 1].rank),
    'ranks are non-decreasing',
  );
  ok(
    ranked.every((r, i) => i === 0 || r.total <= ranked[i - 1].total),
    'totals are sorted descending',
  );

  // 3) Round-trip: create a throwaway bet with celebrities (by name + id),
  //    replace its list, verify scoring of an already-dead celebrity, clean up.
  console.log('\n[3] Bet create/replace/score round-trip (throwaway)');
  const someUser = await prisma.user.findFirst();
  const deadCeleb = await prisma.celebrity.findFirst({
    where: { death: { not: null }, birth: { not: null } },
  });
  const testYear = deadCeleb ? deathYear(deadCeleb.death) : 2099;

  // Avoid colliding with the unique (userId, circleId, year) constraint.
  await prisma.celebritiesOnBet.deleteMany({
    where: { bet: { userId: someUser.id, circleId: circle.id, year: testYear } },
  });
  await prisma.bet.deleteMany({
    where: { userId: someUser.id, circleId: circle.id, year: testYear },
  });

  const created = await bets.create({
    userId: someUser.id,
    circleId: circle.id,
    year: testYear,
    celebrityIds: [deadCeleb.id, '  A Brand New Test Name  '],
  });
  ok(created.CelebritiesOnBet.length === 2, 'created bet has 2 celebrities');
  const deadLink = created.CelebritiesOnBet.find(
    (c) => c.celebrityId === deadCeleb.id,
  );
  const expectedPts = calculPointByCelebrity(deadCeleb.birth, deadCeleb.death);
  ok(
    deadLink.points === expectedPts,
    `already-dead celeb scored on create (got ${deadLink.points}, expected ${expectedPts})`,
  );

  // Replace with a single (the dead) celebrity by name, case-insensitive.
  const replaced = await bets.replaceCelebrities(created.id, [
    deadCeleb.name.toUpperCase(),
  ]);
  ok(replaced.CelebritiesOnBet.length === 1, 'replace narrowed to 1 celebrity');
  ok(
    replaced.CelebritiesOnBet[0].celebrityId === deadCeleb.id,
    'name match resolved to existing celebrity (no duplicate created)',
  );
  ok(
    replaced.CelebritiesOnBet[0].points === expectedPts,
    'replaced list re-scored correctly',
  );

  // Cleanup: the throwaway bet + the on-the-fly created test celebrity.
  await prisma.celebritiesOnBet.deleteMany({ where: { betId: created.id } });
  await prisma.bet.delete({ where: { id: created.id } });
  await prisma.celebrity.deleteMany({
    where: { name: 'A Brand New Test Name' },
  });
  console.log('     cleaned up throwaway data');

  console.log(
    failures === 0 ? '\n✅ Phase 3 integration OK' : `\n❌ ${failures} check(s) failed`,
  );
  process.exitCode = failures === 0 ? 0 : 1;
} catch (err) {
  console.error('Integration error:', err);
  process.exitCode = 1;
} finally {
  await app.close();
}
