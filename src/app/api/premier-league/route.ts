import { NextResponse } from "next/server";
import moment from "moment";
import FootballScraper from "@/lib/FootballScraper";
import { GeminiModel } from "@/ai/model";
import { AiDraft } from "@/ai/aiDraft";
import prisma from "@/lib/prisma";

export type ResponseResult = {
  away_team: string;
  away_win_probability: number;
  confidence_level: string;
  home_team: string;
  home_win_probability: number;
  predicted_score: string;
  predicted_winner: string;
  time: string;
  date: string;
  actual_score: string;
  both_team_to_score: string;
  over_two_goals: string;
};

const schema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      home_team: { type: "string" },
      away_team: { type: "string" },
      date: { type: "string" },
      time: { type: "string" },
      both_team_to_score: { type: "string", enum: ["Yes", "No"] },
      over_two_goals: { type: "string", enum: ["Yes", "No"] },
      predicted_winner: { type: "string" },
      home_win_probability: { type: "number" },
      away_win_probability: { type: "number" },
      confidence_level: { type: "string", enum: ["low", "medium", "high"] },
      predicted_score: { type: "string" }
    },
    required: [
      "home_team",
      "away_team",
      "date",
      "time",
      "predicted_winner",
      "home_win_probability",
      "away_win_probability",
      "both_team_to_score",
      "over_two_goals",
      "confidence_level",
      "predicted_score"
    ],
    additionalProperties: false
  }
};

const scraper = new FootballScraper();
const llm = new GeminiModel();

export async function GET() {
  try {
    const now = moment();
    const currentMonth = now.format("YYYY-MM");

    const isPredictedData = await prisma.premierleague.findMany({
      where: { month: currentMonth },
      orderBy: { id: "asc" }
    });

    // Return early if predictions already exist
    if (isPredictedData && isPredictedData.length > 0) {
      return NextResponse.json({ games: isPredictedData });
    }

    // Scrape matches for current month
    const todayGames = await scraper.scrapePremierLeagueGameFromBBC(currentMonth, false);
    if (todayGames.length === 0) {
      return NextResponse.json({ games: [] });
    }

    // Filter out games already played or with TBD teams
    const upcomingGames = todayGames.filter((game) => {
      const noScore = game.homeScore === undefined && game.awayScore === undefined;
      const hasTBC = game.home_team?.toLowerCase() === "tbc" || game.away_team?.toLowerCase() === "tbc";
      return noScore && !hasTBC;
    });

    if (upcomingGames.length === 0) {
      return NextResponse.json({ games: [] });
    }

    // Create AI prompt
    const { systemMessage, userMessage } = AiDraft(upcomingGames);
    const messages = [systemMessage, userMessage];

    // Get predictions from AI model
    const result = await llm.generateObject(messages, schema, 0.2);
    const Predictions: ResponseResult[] = result.response;

    // Insert predictions into DB
    await prisma.premierleague.createMany({
      data: Predictions.map((pred) => ({
        game_id: `${currentMonth}/${pred.home_team.toLowerCase()}-${pred.away_team.toLowerCase()}`,
        home_team: pred.home_team,
        away_team: pred.away_team,
        predicted_score: pred.predicted_score,
        predicted_winner: pred.predicted_winner,
        month: currentMonth,
        home_win_probability: `${pred.home_win_probability}`,
        away_win_probability: `${pred.away_win_probability}`,
        confidence_level: pred.confidence_level,
        time: pred.time,
        date: pred.date,
        // bts: `${pred.bts}`,
        both_team_to_score: pred.both_team_to_score,
        over_two_goals: pred.over_two_goals,
      }))
    });

    // logger.info(`Inserted ${Predictions.length} predictions`);
    return NextResponse.json({ games: Predictions });
  } catch (error: any) {
    // logger.error(error);
    return NextResponse.json({ error: error.message || "server error" }, { status: 500 });
  }
}
