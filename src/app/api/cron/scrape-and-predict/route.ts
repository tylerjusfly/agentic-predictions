import { NextResponse } from 'next/server';
import { updateCompetitionResults } from "@/jobs/getResultsForPlayedGames";
import { generatePredictions } from "@/services/predictionService";
import FootballScraper from "@/lib/FootballScraper";

type UpdateResultsOptions = {
  tableName: 'premierleague'| 'championsleague';
  scraperMethod: keyof FootballScraper;
};

export async function GET() {
  try {
    // Seed predictions if none exist for the current month
    await generatePredictions("premierleague");

    // Patch actual scores for played games
    const job: UpdateResultsOptions = {
      tableName: "premierleague",
      scraperMethod: "getPremierLeagueMatches"
    };
    await updateCompetitionResults(job);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
