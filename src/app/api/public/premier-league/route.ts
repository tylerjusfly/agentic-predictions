import { NextResponse } from "next/server";
import { generatePredictions } from "@/services/predictionService";

export async function GET() {
  try {
    const allGames = await generatePredictions("premierleague");

    // Return limited fields, max 5 games without actual scores
    const publicGames = allGames
      .filter((g: any) => g.actual_score === null || g.actual_score === undefined)
      .slice(0, 5)
      .map((g: any) => ({
        id: g.id,
        game_id: g.game_id,
        home_team: g.home_team,
        away_team: g.away_team,
        confidence_level: g.confidence_level,
        time: g.time,
        date: g.date,
      }));

    return NextResponse.json({ success: true, games: publicGames }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
