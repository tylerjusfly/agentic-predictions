import { NextResponse } from "next/server";
import moment from "moment";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const now = moment();
    const currentMonth = now.format("YYYY-MM");

    const PredictedData = await prisma.premierleague.findMany({
      where: { month: currentMonth, actual_score: null },
      select: {
        id: true,
        game_id: true,
        home_team: true,
        away_team: true,
        confidence_level: true,
        time: true,
        date: true,
      },
      take: 5
    });

    return NextResponse.json({ success: true, games: PredictedData }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
