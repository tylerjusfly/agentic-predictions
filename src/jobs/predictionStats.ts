import moment from "moment";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { ExtResponseResult } from "./getResultsForPlayedGames";
import { upsertAgentMemoryBatch, AgentMemoryRecord } from "@/services/agentMemoryService";

type Imodel = "premierleague" | "championsleague";

const modelMap = {
  premierleague: prisma.premierleague
} as const;

// ==========================
// 📌 Data Fetcher
// ==========================
async function fetchGames(tableName: Imodel, currentMonth: string) {
  const model = modelMap[tableName as keyof typeof modelMap];
  if (!model) throw new Error(`Invalid table name: ${tableName}`);

  return (await (model as any).findMany({
    where: { month: currentMonth, actual_score: { not: null } },
    select: {
      id: true,
      predicted_score: true,
      actual_score: true,
      predicted_winner: true,
      home_team: true,
      away_team: true,
      both_team_to_score: true,
      over_two_goals: true,
      over_three_goals: true,
      confidence: true
    }
  })) as ExtResponseResult[];
}

// ==========================
// 📌 Utility Helpers
// ==========================
function parseScore(score: string | null): [number, number] | null {
  if (!score) return null;
  const [home, away] = score.split("-").map(Number);
  return [home, away];
}

function isDraw([home, away]: [number, number]) {
  return home === away;
}

// ==========================
// 📌 Stats Calculators
// ==========================
function calculateCorrectScores(games: ExtResponseResult[]) {
  return games.filter((g) => g.predicted_score && g.actual_score && g.predicted_score === g.actual_score).length;
}

function calculateDraws(games: ExtResponseResult[]) {
  const predictedDraws = games.filter((g) => g.predicted_winner === "draw");
  const correctDraws = predictedDraws.filter((g) => {
    const score = parseScore(g.actual_score);
    return score ? isDraw(score) : false;
  }).length;

  return { correctDraws, failedDraws: predictedDraws.length - correctDraws };
}

function calculateStraightWins(games: ExtResponseResult[]) {
  const straightWinPredictions = games.filter((g) => g.predicted_winner && g.predicted_winner !== "draw");

  const straightWinPassed = straightWinPredictions.filter((g) => {
    const score = parseScore(g.actual_score);
    if (!score) return false;

    const [home, away] = score;
    let actualWinner: string | null = null;
    if (home > away) actualWinner = g.home_team;
    else if (away > home) actualWinner = g.away_team;

    return actualWinner && g.predicted_winner === actualWinner;
  }).length;

  return { straightWinPassed, straightWinFailed: straightWinPredictions.length - straightWinPassed };
}

function calculateBTS(games: ExtResponseResult[]) {
  const predictions = games.filter((g) => g.both_team_to_score !== null);
  const passed = predictions.filter((g) => {
    const score = parseScore(g.actual_score);
    if (!score) return false;

    const [home, away] = score;
    const actualBTS = home > 0 && away > 0 ? "Yes" : "No";
    return g.both_team_to_score === actualBTS;
  }).length;

  return { btsPassed: passed, btsFailed: predictions.length - passed };
}

function calculateOvers(games: ExtResponseResult[], key: "over_two_goals" | "over_three_goals", threshold: number) {
  const predictions = games.filter((g) => g[key] !== null);
  const passed = predictions.filter((g) => {
    const score = parseScore(g.actual_score);
    if (!score) return false;

    const [home, away] = score;
    const actualOver = home + away > threshold ? "Yes" : "No";
    return g[key] === actualOver;
  }).length;

  return {
    passed,
    failed: predictions.length - passed
  };
}

// ==========================
// 📌 Brier Score Calculators
// ==========================
function calculateBrierScore(games: ExtResponseResult[]): number | null {
  const eligible = games.filter((g) => g.confidence != null && g.predicted_winner && g.actual_score);
  if (eligible.length === 0) return null;

  const sum = eligible.reduce((acc, g) => {
    const score = parseScore(g.actual_score);
    if (!score) return acc;

    const [home, away] = score;
    let actualWinner: string;
    if (home > away) actualWinner = g.home_team;
    else if (away > home) actualWinner = g.away_team;
    else actualWinner = "draw";

    const correct = g.predicted_winner === actualWinner ? 1 : 0;
    return acc + Math.pow(g.confidence! - correct, 2);
  }, 0);

  return sum / eligible.length;
}

function calculateBrierWinner(games: ExtResponseResult[]): number | null {
  const eligible = games.filter(
    (g) => g.confidence != null && g.predicted_winner && g.predicted_winner !== "draw" && g.actual_score
  );
  if (eligible.length === 0) return null;

  const sum = eligible.reduce((acc, g) => {
    const score = parseScore(g.actual_score);
    if (!score) return acc;

    const [home, away] = score;
    let actualWinner: string | null = null;
    if (home > away) actualWinner = g.home_team;
    else if (away > home) actualWinner = g.away_team;

    const correct = actualWinner && g.predicted_winner === actualWinner ? 1 : 0;
    return acc + Math.pow(g.confidence! - correct, 2);
  }, 0);

  return sum / eligible.length;
}

function calculateBrierBtts(games: ExtResponseResult[]): number | null {
  const eligible = games.filter((g) => g.confidence != null && g.both_team_to_score != null && g.actual_score);
  if (eligible.length === 0) return null;

  const sum = eligible.reduce((acc, g) => {
    const score = parseScore(g.actual_score);
    if (!score) return acc;

    const [home, away] = score;
    const actualBTS = home > 0 && away > 0 ? "Yes" : "No";
    const correct = g.both_team_to_score === actualBTS ? 1 : 0;
    return acc + Math.pow(g.confidence! - correct, 2);
  }, 0);

  return sum / eligible.length;
}

function calculateBrierGoals(games: ExtResponseResult[]): number | null {
  const eligible = games.filter((g) => g.confidence != null && g.over_two_goals != null && g.actual_score);
  if (eligible.length === 0) return null;

  const sum = eligible.reduce((acc, g) => {
    const score = parseScore(g.actual_score);
    if (!score) return acc;

    const [home, away] = score;
    const actualOver = home + away > 2 ? "Yes" : "No";
    const correct = g.over_two_goals === actualOver ? 1 : 0;
    return acc + Math.pow(g.confidence! - correct, 2);
  }, 0);

  return sum / eligible.length;
}

// ==========================
// 📌 Drift Detection
// ==========================
const DRIFT_THRESHOLDS: Record<string, number> = {
  straight_win: 0.45,
  btts: 0.45,
  over_2_goals: 0.45,
  over_3_goals: 0.40,
  correct_score: 0.10,
  draw: 0.35,
};
const DRIFT_WINDOW = 20;

async function detectDrift(games: ExtResponseResult[], league: string) {
  const recent = games.slice(-DRIFT_WINDOW);
  if (recent.length < DRIFT_WINDOW) return;

  const currentMonth = moment().format("YYYY-MM");

  const marketChecks: { market: string; passed: number; total: number }[] = [];

  // Straight win
  const swGames = recent.filter((g) => g.predicted_winner && g.predicted_winner !== "draw");
  const swPassed = swGames.filter((g) => {
    const score = parseScore(g.actual_score);
    if (!score) return false;
    const [home, away] = score;
    let actualWinner: string | null = null;
    if (home > away) actualWinner = g.home_team;
    else if (away > home) actualWinner = g.away_team;
    return actualWinner && g.predicted_winner === actualWinner;
  }).length;
  marketChecks.push({ market: "straight_win", passed: swPassed, total: swGames.length });

  // BTTS
  const bttsGames = recent.filter((g) => g.both_team_to_score != null);
  const bttsPassed = bttsGames.filter((g) => {
    const score = parseScore(g.actual_score);
    if (!score) return false;
    const [home, away] = score;
    return g.both_team_to_score === (home > 0 && away > 0 ? "Yes" : "No");
  }).length;
  marketChecks.push({ market: "btts", passed: bttsPassed, total: bttsGames.length });

  // Over 2 goals
  const o2Games = recent.filter((g) => g.over_two_goals != null);
  const o2Passed = o2Games.filter((g) => {
    const score = parseScore(g.actual_score);
    if (!score) return false;
    const [home, away] = score;
    return g.over_two_goals === (home + away > 2 ? "Yes" : "No");
  }).length;
  marketChecks.push({ market: "over_2_goals", passed: o2Passed, total: o2Games.length });

  // Over 3 goals
  const o3Games = recent.filter((g) => g.over_three_goals != null);
  const o3Passed = o3Games.filter((g) => {
    const score = parseScore(g.actual_score);
    if (!score) return false;
    const [home, away] = score;
    return g.over_three_goals === (home + away > 3 ? "Yes" : "No");
  }).length;
  marketChecks.push({ market: "over_3_goals", passed: o3Passed, total: o3Games.length });

  // Correct score
  const csPassed = recent.filter((g) => g.predicted_score && g.actual_score && g.predicted_score === g.actual_score).length;
  marketChecks.push({ market: "correct_score", passed: csPassed, total: recent.length });

  // Draw
  const drawGames = recent.filter((g) => g.predicted_winner === "draw");
  const drawPassed = drawGames.filter((g) => {
    const score = parseScore(g.actual_score);
    return score ? isDraw(score) : false;
  }).length;
  marketChecks.push({ market: "draw", passed: drawPassed, total: drawGames.length });

  // Check thresholds and insert drift signals
  const signals = marketChecks
    .filter((m) => m.total > 0)
    .map((m) => ({ ...m, accuracy: m.passed / m.total }))
    .filter((m) => {
      const threshold = DRIFT_THRESHOLDS[m.market];
      return threshold !== undefined && m.accuracy < threshold;
    });

  if (signals.length > 0) {
    await prisma.driftSignal.createMany({
      data: signals.map((s) => ({
        league,
        market: s.market,
        month: currentMonth,
        accuracy: s.accuracy,
        threshold: DRIFT_THRESHOLDS[s.market],
        window: DRIFT_WINDOW,
      })),
    });
    logger.info(`[${league}] Drift detected in: ${signals.map((s) => s.market).join(", ")}`);
  }
}

// ==========================
// 📌 Orchestrator
// ==========================
export const calculatePredictionStats = async (tableName: Imodel) => {
  try {
    const now = moment();
    const currentMonth = now.format("YYYY-MM");

    const games = await fetchGames(tableName, currentMonth);
    if (!games.length) {
      logger.info(`[${tableName}] No games found for ${currentMonth}`);
      return;
    }

    const totalPredictions = games.length;
    const correctScore = calculateCorrectScores(games);
    const { correctDraws, failedDraws } = calculateDraws(games);
    const { straightWinPassed, straightWinFailed } = calculateStraightWins(games);
    const { btsPassed, btsFailed } = calculateBTS(games);
    const over2 = calculateOvers(games, "over_two_goals", 2);
    const over3 = calculateOvers(games, "over_three_goals", 3);

    const failedScore = totalPredictions - correctScore;

    // Brier scores
    const brierScore = calculateBrierScore(games);
    const brierWinner = calculateBrierWinner(games);
    const brierBtts = calculateBrierBtts(games);
    const brierGoals = calculateBrierGoals(games);

    logger.info(`Saving [${tableName}] Stats for ${currentMonth}`);
    // Insert or update to prisma db based on month and league

    const statData = {
      totalPredictions,
      correctScorePassed: correctScore,
      correctScoreFailed: failedScore,
      over15Passed: over2.passed,
      over15Failed: over2.failed,
      over25Passed: over3.passed,
      over25Failed: over3.failed,
      btsPassed: btsPassed,
      btsFailed: btsFailed,
      straightWinPassed: straightWinPassed,
      straightWinFailed: straightWinFailed,
      drawPassed: correctDraws,
      drawFailed: failedDraws,
      brierScore,
      brierWinner,
      brierBtts,
      brierGoals,
    };

    await prisma.predictionStat.upsert({
      where: {
        month_league: {
          month: currentMonth,
          league: tableName
        }
      },
      update: statData,
      create: {
        month: currentMonth,
        league: tableName,
        ...statData,
      }
    });
    logger.info(`[${tableName}] Stats for ${currentMonth} saved`);

    // Populate agent memory per market
    const memoryRecords: AgentMemoryRecord[] = [];
    const addMemory = (market: string, passed: number, failed: number, brier?: number | null) => {
      const total = passed + failed;
      if (total > 0) {
        memoryRecords.push({
          league: tableName,
          market,
          month: currentMonth,
          accuracy: Math.round((passed / total) * 10000) / 10000,
          brierScore: brier ?? null,
          sampleSize: total,
        });
      }
    };

    addMemory("straight_win", straightWinPassed, straightWinFailed, brierWinner);
    addMemory("btts", btsPassed, btsFailed, brierBtts);
    addMemory("over_2_goals", over2.passed, over2.failed, brierGoals);
    addMemory("over_3_goals", over3.passed, over3.failed);
    addMemory("correct_score", correctScore, failedScore, brierScore);
    addMemory("draw", correctDraws, failedDraws);

    if (memoryRecords.length > 0) {
      await upsertAgentMemoryBatch(memoryRecords);
    }

    // Drift detection
    await detectDrift(games, tableName);
  } catch (error: any) {
    logger.error(`Error calculating stats for ${tableName}: ${error.message}`);
  }
};
