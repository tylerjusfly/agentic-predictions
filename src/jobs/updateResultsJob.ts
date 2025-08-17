import FootballScraper from "@/lib/FootballScraper";
import { updateCompetitionResults } from "./getResultsForPlayedGames";
import logger from "@/lib/logger";


type UpdateResultsOptions = {
  tableName: 'premierleague'| 'championsleague';
  scraperMethod: keyof FootballScraper;
};

const jobs: UpdateResultsOptions[] = [
  {
    tableName: "premierleague",
    scraperMethod: "scrapePremierLeagueGameFromBBC"
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
