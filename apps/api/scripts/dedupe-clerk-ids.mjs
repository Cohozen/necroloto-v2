// Deduplicates User rows that share a clerkId, so a UNIQUE(clerkId) constraint
// can be added (see prisma migration add_user_clerkid_unique). For each clerkId
// group it keeps the most recently updated row (the "winner") and folds the
// others into it: Notifications/Bets/Memberships are reassigned to the winner,
// dropping any that would collide on an application-level unique
// (Bet @@unique([userId, circleId, year]), Membership @@unique([userId, circleId])).
// Mirrors the collision handling of CelebritiesService.merge.
//
// Runs against DATABASE_URL. DRY-RUN by default (prints the plan, no writes);
// pass --apply to execute inside a single transaction. Idempotent.
//
// Usage:
//   node scripts/dedupe-clerk-ids.mjs            # dry-run
//   node scripts/dedupe-clerk-ids.mjs --apply    # execute
import 'dotenv/config';
import pg from 'pg';

const APPLY = process.argv.includes('--apply');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

let reassignedBets = 0;
let droppedBets = 0;
let reassignedMemberships = 0;
let droppedMemberships = 0;
let reassignedNotifications = 0;
let deletedUsers = 0;

async function dedupeGroup(clerkId) {
    const { rows: users } = await client.query(
        `SELECT id, "updatedAt", "createdAt" FROM "User"
         WHERE "clerkId" = $1
         ORDER BY "updatedAt" DESC, "createdAt" DESC`,
        [clerkId],
    );
    const [winner, ...losers] = users;
    console.log(
        `\nclerkId ${clerkId}: ${users.length} rows → keep ${winner.id}, fold ${losers.length}`,
    );

    for (const loser of losers) {
        // Notifications: no unique constraint, always reassignable.
        const notifs = await client.query(`SELECT id FROM "Notification" WHERE "userId" = $1`, [
            loser.id,
        ]);
        if (notifs.rowCount > 0) {
            reassignedNotifications += notifs.rowCount;
            if (APPLY) {
                await client.query(`UPDATE "Notification" SET "userId" = $1 WHERE "userId" = $2`, [
                    winner.id,
                    loser.id,
                ]);
            }
        }

        // Bets: unique on (userId, circleId, year). A null circleId never
        // collides (NULLs are distinct in a UNIQUE index), so only guard rows
        // with a real circleId.
        const { rows: bets } = await client.query(
            `SELECT id, "circleId", year FROM "Bet" WHERE "userId" = $1`,
            [loser.id],
        );
        for (const bet of bets) {
            let collides = false;
            if (bet.circleId !== null) {
                const dup = await client.query(
                    `SELECT id FROM "Bet" WHERE "userId" = $1 AND "circleId" = $2 AND year = $3`,
                    [winner.id, bet.circleId, bet.year],
                );
                collides = dup.rowCount > 0;
            }
            if (collides) {
                droppedBets += 1;
                console.log(
                    `  drop bet ${bet.id} (winner already bets circle ${bet.circleId} / ${bet.year})`,
                );
                if (APPLY) {
                    await client.query(`DELETE FROM "CelebritiesOnBet" WHERE "betId" = $1`, [
                        bet.id,
                    ]);
                    await client.query(`DELETE FROM "Bet" WHERE id = $1`, [bet.id]);
                }
            } else {
                reassignedBets += 1;
                if (APPLY) {
                    await client.query(`UPDATE "Bet" SET "userId" = $1 WHERE id = $2`, [
                        winner.id,
                        bet.id,
                    ]);
                }
            }
        }

        // Memberships: unique on (userId, circleId); circleId is non-null.
        const { rows: memberships } = await client.query(
            `SELECT id, "circleId" FROM "Membership" WHERE "userId" = $1`,
            [loser.id],
        );
        for (const m of memberships) {
            const dup = await client.query(
                `SELECT id FROM "Membership" WHERE "userId" = $1 AND "circleId" = $2`,
                [winner.id, m.circleId],
            );
            if (dup.rowCount > 0) {
                droppedMemberships += 1;
                console.log(`  drop membership ${m.id} (winner already in circle ${m.circleId})`);
                if (APPLY) await client.query(`DELETE FROM "Membership" WHERE id = $1`, [m.id]);
            } else {
                reassignedMemberships += 1;
                if (APPLY) {
                    await client.query(`UPDATE "Membership" SET "userId" = $1 WHERE id = $2`, [
                        winner.id,
                        m.id,
                    ]);
                }
            }
        }

        deletedUsers += 1;
        if (APPLY) await client.query(`DELETE FROM "User" WHERE id = $1`, [loser.id]);
    }
}

try {
    await client.connect();
    console.log(
        APPLY
            ? '=== APPLY MODE (writing) ==='
            : '=== DRY-RUN (no writes) — pass --apply to execute ===',
    );

    const { rows: groups } = await client.query(
        `SELECT "clerkId", COUNT(*)::int AS n FROM "User"
         GROUP BY "clerkId" HAVING COUNT(*) > 1
         ORDER BY n DESC`,
    );

    if (groups.length === 0) {
        console.log('\nNo duplicate clerkId — nothing to do. Safe to add UNIQUE(clerkId).');
    } else {
        console.log(`Found ${groups.length} clerkId group(s) with duplicates.`);
        if (APPLY) await client.query('BEGIN');
        try {
            for (const g of groups) await dedupeGroup(g.clerkId);
            if (APPLY) await client.query('COMMIT');
        } catch (err) {
            if (APPLY) await client.query('ROLLBACK');
            throw err;
        }

        console.log('\n--- Summary ---');
        console.log(`  users deleted:           ${deletedUsers}`);
        console.log(`  notifications reassigned:${reassignedNotifications}`);
        console.log(`  bets reassigned:         ${reassignedBets}  (dropped ${droppedBets})`);
        console.log(
            `  memberships reassigned:  ${reassignedMemberships}  (dropped ${droppedMemberships})`,
        );
        console.log(
            APPLY
                ? '\nDone. You can now run prisma migrate deploy.'
                : '\nDry-run only — re-run with --apply to execute.',
        );
    }
} catch (err) {
    console.error('dedupe failed:', err);
    process.exitCode = 1;
} finally {
    await client.end();
}
