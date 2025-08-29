import moment from "moment";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { ExtResponseResult } from "./getResultsForPlayedGames";

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
      over_three_goals: true
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

    logger.info(`Saving [${tableName}] Stats for ${currentMonth}`);
    // Insert or update to prisma db based on month and league

    await prisma.predictionStat.upsert({
      where: {
        month_league: {
          month: currentMonth,
          league: tableName
        }
      },
      update: {
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
        drawFailed: failedDraws
      },
      create: {
        totalPredictions: totalPredictions,
        month: currentMonth,
        league: tableName,
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
        drawFailed: failedDraws
      }
    });
    logger.info(`[${tableName}] Stats for ${currentMonth} saved`);
  } catch (error: any) {
    logger.error(`Error calculating stats for ${tableName}: ${error.message}`);
  }
};
