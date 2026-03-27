import axios from "axios";
import moment from "moment";
import { IBBCSoccerMatch } from "@/lib/FootballScraper";
import { canonicalize } from "@/lib/teamNames";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { League } from "./predictionService";

// ─── Types ────────────────────────────────────────────────

export type OddsData = {
  home_win: number;
  draw: number;
  away_win: number;
  bookmaker: string;
};

export type AccuracySignal = {
  market: string;
  passed: number;
  failed: number;
  accuracy: number;
  brierScore?: number;
};

export type MatchContext = {
  home_team: string;
  away_team: string;
  home_team_canonical: string;
  away_team_canonical: string;
  date: string;
  time: string | null;
  odds: OddsData | null;
};

export type EnrichedContext = {
  league: League;
  month: string;
  matches: MatchContext[];
  accuracy_history: AccuracySignal[];
};

// ─── Odds API ─────────────────────────────────────────────

const ODDS_SPORT_KEY: Record<League, string> = {
  premierleague: "soccer_epl",
};

async function fetchOdds(league: League): Promise<Map<string, OddsData>> {
  const oddsMap = new Map<string, OddsData>();
  const apiKey = process.env.THE_ODDS_API_KEY;

  if (!apiKey) {
    logger.info("[ContextAssembler] THE_ODDS_API_KEY not set — skipping odds enrichment.");
    return oddsMap;
  }

  const sportKey = ODDS_SPORT_KEY[league];
  if (!sportKey) return oddsMap;

  try {
    const response = await axios.get(
      `https://api.the-odds-api.com/v4/sports/${sportKey}/odds`,
      {
        params: {
          apiKey,
          regions: "uk",
          markets: "h2h",
          oddsFormat: "decimal",
        },
        timeout: 10000,
      }
    );

    for (const event of response.data) {
      const homeCanonical = canonicalize(event.home_team);
      const awayCanonical = canonicalize(event.away_team);
      const key = `${homeCanonical}-vs-${awayCanonical}`;

      // Use the first bookmaker with h2h market
      const bookmaker = event.bookmakers?.[0];
      const h2hMarket = bookmaker?.markets?.find((m: any) => m.key === "h2h");

      if (h2hMarket) {
        const outcomes = h2hMarket.outcomes;
        const homeOutcome = outcomes.find((o: any) => canonicalize(o.name) === homeCanonical);
        const awayOutcome = outcomes.find((o: any) => canonicalize(o.name) === awayCanonical);
        const drawOutcome = outcomes.find((o: any) => o.name === "Draw");

        oddsMap.set(key, {
          home_win: homeOutcome?.price ?? 0,
          draw: drawOutcome?.price ?? 0,
          away_win: awayOutcome?.price ?? 0,
          bookmaker: bookmaker.title,
        });
      }
    }

    logger.info(`[ContextAssembler] Fetched odds for ${oddsMap.size} matches.`);
  } catch (error: any) {
    logger.warn(`[ContextAssembler] Failed to fetch odds: ${error.message}`);
  }

  return oddsMap;
}

// ─── Accuracy History ─────────────────────────────────────

async function fetchAccuracyHistory(league: League): Promise<AccuracySignal[]> {
  try {
    const months = Array.from({ length: 3 }, (_, i) =>
      moment().subtract(i + 1, "months").format("YYYY-MM")
    );

    const rows = await prisma.agentMemory.findMany({
      where: {
        league,
        month: { in: months },
      },
      orderBy: { month: "desc" },
    });

    if (rows.length === 0) return [];

    // Aggregate per market across months
    const byMarket = new Map<string, { totalSamples: number; weightedAcc: number; brierSum: number; brierCount: number }>();

    for (const row of rows) {
      const existing = byMarket.get(row.market) ?? { totalSamples: 0, weightedAcc: 0, brierSum: 0, brierCount: 0 };
      const samples = row.sampleSize ?? 0;
      existing.totalSamples += samples;
      existing.weightedAcc += row.accuracy * samples;
      if (row.brierScore != null) {
        existing.brierSum += row.brierScore;
        existing.brierCount += 1;
      }
      byMarket.set(row.market, existing);
    }

    const signals: AccuracySignal[] = [];
    for (const [market, agg] of byMarket) {
      if (agg.totalSamples === 0) continue;
      const accuracy = Math.round((agg.weightedAcc / agg.totalSamples) * 10000) / 10000;
      const passed = Math.round(accuracy * agg.totalSamples);
      signals.push({
        market,
        passed,
        failed: agg.totalSamples - passed,
        accuracy,
        ...(agg.brierCount > 0 && {
          brierScore: Math.round((agg.brierSum / agg.brierCount) * 10000) / 10000,
        }),
      });
    }

    return signals;
  } catch (error: any) {
    logger.warn(`[ContextAssembler] Failed to fetch accuracy history: ${error.message}`);
    return [];
  }
}

// ─── Assembler ────────────────────────────────────────────

export async function assembleContext(
  matches: IBBCSoccerMatch[],
  league: League
): Promise<EnrichedContext> {
  const currentMonth = moment().format("YYYY-MM");

  // Fetch odds and accuracy in parallel
  const [oddsMap, accuracyHistory] = await Promise.all([
    fetchOdds(league),
    fetchAccuracyHistory(league),
  ]);

  // Build enriched match contexts with canonicalized names and odds
  const enrichedMatches: MatchContext[] = matches.map((match) => {
    const homeCanonical = canonicalize(match.home_team);
    const awayCanonical = canonicalize(match.away_team);
    const oddsKey = `${homeCanonical}-vs-${awayCanonical}`;

    return {
      home_team: match.home_team,
      away_team: match.away_team,
      home_team_canonical: homeCanonical,
      away_team_canonical: awayCanonical,
      date: match.date,
      time: match.time,
      odds: oddsMap.get(oddsKey) ?? null,
    };
  });

  return {
    league,
    month: currentMonth,
    matches: enrichedMatches,
    accuracy_history: accuracyHistory,
  };
}
