import moment from "moment";
import { dbAll, dbExec, dbRun } from "../../utils/databaseHelpers";
import logger from "../../utils/logger";
import FootballScraper from "../../scrapers/footballScraper";
import { ResponseResult } from "../getDailyPredictions/service";

const scraper = new FootballScraper();

export type ExtResponseResult = ResponseResult & {
  month: string;
  game_id: string;
};

interface UpdateResultsOptions {
  tableName: string;
  scraperMethod: keyof FootballScraper; // method name in FootballScraper
}

export const updateCompetitionResults = async ({ tableName, scraperMethod }: UpdateResultsOptions) => {
  try {
    const now = moment();
    const currentMonth = now.format("YYYY-MM");

    // Dynamically call scraper method
    if (typeof scraper[scraperMethod] !== "function") {
      throw new Error(`Scraper method "${scraperMethod}" not found`);
    }
    const results = await scraper[scraperMethod](currentMonth, true);

    if (!results.length) {
      logger.info(`[${tableName}] Skipped update because no game was played today.`);
      return;
    }

    // Get games without scores
    const existingScores = (await dbAll(
      `SELECT game_id, actual_score FROM ${tableName} WHERE month = ? AND actual_score IS NULL`,
      [currentMonth]
    )) as ExtResponseResult[];

    const existingGameIds = new Set(existingScores.map((score) => score.game_id));

    // Filter only played games that match existing records
    const gamesPlayedToday = results
      .map((match) => ({
        ...match,
        game_id: `${currentMonth}/${match.home_team.toLowerCase()}-${match.away_team.toLowerCase()}`
      }))
      .filter((match) => existingGameIds.has(match.game_id) && !(match.homeScore === undefined && match.awayScore === undefined));


    if (!gamesPlayedToday.length) {
      logger.info(`[${tableName}] No matching games found to update.`);
      return;
    }

    // Batch update scores
    await dbExec("BEGIN TRANSACTION");
    for (const game of gamesPlayedToday) {
      if (game.homeScore !== undefined && game.awayScore !== undefined) {
        const actualScore = `${game.homeScore}-${game.awayScore}`;
        await dbRun(
          `UPDATE ${tableName}
           SET actual_score = ?
           WHERE game_id = ?`,
          [actualScore, game.game_id]
        );
      }
    }
    await dbExec("COMMIT");

    logger.info(`[${tableName}] Successfully updated ${gamesPlayedToday.length} games.`);
  } catch (error: any) {
    await dbExec("ROLLBACK");
    logger.error(`Error updating ${tableName} results: ${error.message}`);
    // Optional: send notification about error
  }
};