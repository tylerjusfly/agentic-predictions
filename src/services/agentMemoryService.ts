import prisma from "@/lib/prisma";
import logger from "@/lib/logger";

export type AgentMemoryRecord = {
  league: string;
  market: string;
  month: string;
  accuracy: number;
  brierScore?: number | null;
  sampleSize?: number | null;
};

/**
 * Upsert a single agent memory record.
 */
export async function upsertAgentMemory(record: AgentMemoryRecord) {
  return prisma.agentMemory.upsert({
    where: {
      league_market_month: {
        league: record.league,
        market: record.market,
        month: record.month,
      },
    },
    update: {
      accuracy: record.accuracy,
      brierScore: record.brierScore ?? null,
      sampleSize: record.sampleSize ?? null,
    },
    create: {
      league: record.league,
      market: record.market,
      month: record.month,
      accuracy: record.accuracy,
      brierScore: record.brierScore ?? null,
      sampleSize: record.sampleSize ?? null,
    },
  });
}

/**
 * Upsert multiple agent memory records in a transaction.
 */
export async function upsertAgentMemoryBatch(records: AgentMemoryRecord[]) {
  try {
    await prisma.$transaction(
      records.map((r) =>
        prisma.agentMemory.upsert({
          where: {
            league_market_month: {
              league: r.league,
              market: r.market,
              month: r.month,
            },
          },
          update: {
            accuracy: r.accuracy,
            brierScore: r.brierScore ?? null,
            sampleSize: r.sampleSize ?? null,
          },
          create: {
            league: r.league,
            market: r.market,
            month: r.month,
            accuracy: r.accuracy,
            brierScore: r.brierScore ?? null,
            sampleSize: r.sampleSize ?? null,
          },
        })
      )
    );
    logger.info(`[AgentMemory] Upserted ${records.length} records.`);
  } catch (error: any) {
    logger.error(`[AgentMemory] Batch upsert failed: ${error.message}`);
  }
}

/**
 * Get recent memory for a league across the last N months.
 */
export async function getRecentMemory(
  league: string,
  months: string[]
): Promise<AgentMemoryRecord[]> {
  const rows = await prisma.agentMemory.findMany({
    where: {
      league,
      month: { in: months },
    },
    orderBy: { month: "desc" },
  });

  return rows.map((r) => ({
    league: r.league,
    market: r.market,
    month: r.month,
    accuracy: r.accuracy,
    brierScore: r.brierScore,
    sampleSize: r.sampleSize,
  }));
}

/**
 * Get memory for a specific league and market across months.
 */
export async function getMarketMemory(
  league: string,
  market: string,
  months: string[]
): Promise<AgentMemoryRecord[]> {
  const rows = await prisma.agentMemory.findMany({
    where: {
      league,
      market,
      month: { in: months },
    },
    orderBy: { month: "desc" },
  });

  return rows.map((r) => ({
    league: r.league,
    market: r.market,
    month: r.month,
    accuracy: r.accuracy,
    brierScore: r.brierScore,
    sampleSize: r.sampleSize,
  }));
}
