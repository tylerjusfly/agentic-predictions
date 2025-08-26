'use server'

import { updateCompetitionResults } from "@/jobs/getResultsForPlayedGames";
import FootballScraper from "@/lib/FootballScraper";

type UpdateResultsOptions = {
  tableName: 'premierleague'| 'championsleague';
  scraperMethod: keyof FootballScraper;
};
 
export async function updatePremierLeaguesGames() {
    try {
      const job:UpdateResultsOptions = {
        tableName: "premierleague",
        scraperMethod: "scrapePremierLeagueGameFromBBC"
      }
      await updateCompetitionResults(job);
      return { success: true };
    } catch (error:any) {
      return { 
        success: false, 
        error: error?.message || "Unknown server error" 
      };
    }
        
}