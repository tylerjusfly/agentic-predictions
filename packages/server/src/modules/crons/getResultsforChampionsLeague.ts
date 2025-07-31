import FootballScraper from "../../scrapers/footballScraper";
import moment from "moment";
import { dbAll, dbExec, dbRun } from "../../utils/databaseHelpers";
import logger from "../../utils/logger";
import { ResponseResult } from "../getDailyPredictions/service";

const scraper = new FootballScraper();

export type ExtResponseResult = ResponseResult & {
  month: string;
  game_id: string;
};

export const getChampionsLeagueResults = async () => {
  try {
    const now = moment();
    const currentMonth = now.format("YYYY-MM");
    // const todayDate = moment().format("dddd Do MMMM");
    const todayDate = "Tuesday 15th July";

    const championsResults = await scraper.scrapeChampionsLeagueFromBBC(currentMonth, true);

    if (championsResults.length <= 0) {
      logger.info("skipped games update because no game was played today.");
      return;
    }

    // fetch data where actual_score is null
    const existingScores = (await dbAll(
      `SELECT game_id, actual_score FROM championsleague WHERE month = ? AND actual_score IS NULL`,
      [currentMonth]
    )) as ExtResponseResult[];

    const existingGameIds = new Set(existingScores.map((score) => score.game_id));

    // Step 2: Construct and filter gamesPlayedToday based on that Set
    const gamesPlayedToday = championsResults
      .map((match) => ({
        ...match,
        game_id: `${currentMonth}/${match.home_team.toLowerCase()}-${match.away_team.toLowerCase()}`
      }))
      .filter((match) => existingGameIds.has(match.game_id));

    // do a batch update here
    if (gamesPlayedToday.length) {
      await dbExec("BEGIN TRANSACTION");
      for (const game of gamesPlayedToday) {
        if (game.homeScore !== undefined && game.awayScore !== undefined) {
          const actualScore = `${game.homeScore}-${game.awayScore}`;
          await dbRun(
            `UPDATE championsleague
             SET actual_score = ?
             WHERE game_id = ?`,
            [actualScore, game.game_id]
          );
        }
      }
      await dbExec("COMMIT");

      logger.info("Successfully updated");
    }

  } catch (error) {
    await dbExec("ROLLBACK");
    //  Notify me of the error
  }
};
