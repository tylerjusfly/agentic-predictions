import FootballScraper from "../../scrapers/footballScraper";
import logger from "../../utils/logger";
import { updateCompetitionResults } from "./getresultsForGames";

type UpdateResultsOptions = {
  tableName: string;
  scraperMethod: keyof FootballScraper;
};

const jobs: UpdateResultsOptions[] = [
  {
    tableName: "premierleague",
    scraperMethod: "scrapePremierLeagueGameFromBBC"
  },
  {
    tableName: "championsleague",
    scraperMethod: "scrapeChampionsLeagueFromBBC"
  },
  // add more competitions here easily
];

export async function runUpdateResultsJob() {
  logger.info("[CRON] Starting results update...");

  for (const job of jobs) {
    try {
      await updateCompetitionResults(job);
      logger.info(`[CRON] Updated results for ${job.tableName}`);
    } catch (error: any) {
      logger.error(`[CRON] Error updating ${job.tableName}: ${error.message}`);
    }
  }

  logger.info("[CRON] All updates completed.");
}
