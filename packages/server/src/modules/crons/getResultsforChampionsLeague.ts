import FootballScraper from "../../scrapers/footballScraper";
import moment from "moment";
import { dbExec, dbRun } from "../../utils/databaseHelpers";
import logger from "../../utils/logger";

const scraper = new FootballScraper();

export const getChampionsLeagueResults = async () => {
  try {
    const now = moment();
    const currentMonth = now.format("YYYY-MM");
    const todayDate = moment().format("dddd Do MMMM");
    //   const todayDate = "Tuesday 15th July";

    const championsResults = await scraper.scrapeChampionsLeagueFromBBC(currentMonth, true);

    // Remove all matches that was not played today
    const gamesPlayedToday = championsResults
      .filter((match) => match.date === todayDate)
      .map((match) => ({
        ...match,
        game_id: `${currentMonth}/${match.homeTeam.toLowerCase()}-${match.awayTeam.toLowerCase()}`
      }));

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

        // Fetch data with empty  scores
  //  const isPredictedData = (await dbAll("SELECT * FROM championsleague WHERE month = ? AND actual_score IS NULL", [currentMonth])) as ResponseResult[];

      logger.info("Successfully updated");
    }

    logger.info("skipped games update because no game was played today.");
  } catch (error) {
    await dbExec("ROLLBACK");
    //  Notify me of the error
  }
};
