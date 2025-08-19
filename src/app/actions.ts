'use server'

import { updateCompetitionResults } from "@/jobs/getResultsForPlayedGames";
import FootballScraper from "@/lib/FootballScraper";
import { revalidatePath } from "next/cache";

type UpdateResultsOptions = {
  tableName: 'premierleague'| 'championsleague';
  scraperMethod: keyof FootballScraper;
};
 
export async function updatePremierLeaguesGames() {
     const job:UpdateResultsOptions = {
          tableName: "premierleague",
          scraperMethod: "scrapePremierLeagueGameFromBBC"
        }
        await updateCompetitionResults(job);
        revalidatePath(`/dashboard`)
}