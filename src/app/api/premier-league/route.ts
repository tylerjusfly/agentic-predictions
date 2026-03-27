import { NextResponse } from "next/server";
import { generatePredictions } from "@/services/predictionService";

// Re-export for backwards compatibility (used by getResultsForPlayedGames.ts)
export type { ResponseResult } from "@/services/predictionService";

export async function GET() {
  try {
    const games = await generatePredictions("premierleague");
    return NextResponse.json({ games });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "server error" }, { status: 500 });
  }
}
