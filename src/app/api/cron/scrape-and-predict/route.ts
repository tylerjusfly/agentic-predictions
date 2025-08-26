import { NextResponse } from 'next/server';
import { updateCompetitionResults } from "@/jobs/getResultsForPlayedGames";
import FootballScraper from "@/lib/FootballScraper";

type UpdateResultsOptions = {
  tableName: 'premierleague'| 'championsleague';
  scraperMethod: keyof FootballScraper;
};
 

export async function GET() {
  // request: Request
  // const { searchParams } = new URL(request.url);
  // const secret = searchParams.get('secret');
  
  try {
    // if (secret !== process.env.CRON_SECRET) {
    //   return new Response('Unauthorized', { status: 401 });
    // }

    const job:UpdateResultsOptions = {
      tableName: "premierleague",
      scraperMethod: "scrapePremierLeagueGameFromBBC"
    }
    await updateCompetitionResults(job);
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ success: false }, { status: 500 });
    
  }

}