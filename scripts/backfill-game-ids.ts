/**
 * Backfill script — migrates existing game_id values to canonical format.
 *
 * Old format:  "2026-03/arsenal fc-chelsea fc"
 * New format:  "2026-03/arsenal-vs-chelsea"
 *
 * Usage:
 *   npx tsx scripts/backfill-game-ids.ts          # dry run (default)
 *   npx tsx scripts/backfill-game-ids.ts --apply   # apply changes
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { generateGameId } from "../src/lib/teamNames";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const dryRun = !process.argv.includes("--apply");

async function backfillTable(tableName: "premierleague") {
  const model = prisma[tableName];

  const rows = await (model as any).findMany({
    select: { id: true, game_id: true, home_team: true, away_team: true, month: true },
  });

  console.log(`\n[${tableName}] Found ${rows.length} rows to check`);

  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const newGameId = generateGameId(row.month, row.home_team, row.away_team);

    if (row.game_id === newGameId) {
      skipped++;
      continue;
    }

    console.log(`  ${row.game_id}  →  ${newGameId}`);

    if (!dryRun) {
      try {
        await (model as any).update({
          where: { id: row.id },
          data: { game_id: newGameId },
        });
        updated++;
      } catch (err: any) {
        // Duplicate key means a row with the new game_id already exists
        errors.push(`  CONFLICT id=${row.id}: ${err.message}`);
      }
    } else {
      updated++;
    }
  }

  console.log(`[${tableName}] ${dryRun ? "Would update" : "Updated"}: ${updated}, Skipped (already canonical): ${skipped}`);
  if (errors.length) {
    console.log(`[${tableName}] Errors:`);
    errors.forEach((e) => console.log(e));
  }
}

async function main() {
  console.log(dryRun ? "=== DRY RUN (pass --apply to write changes) ===" : "=== APPLYING CHANGES ===");

  await backfillTable("premierleague");

  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
