import moment from "moment";
import FootballScraper, { IBBCSoccerMatch } from "@/lib/FootballScraper";
import { createLLM } from "@/ai/model";
import { AiDraft } from "@/ai/aiDraft";
import prisma from "@/lib/prisma";
import { generateGameId } from "@/lib/teamNames";

export type League = "premierleague";

export type ResponseResult = {
  away_team: string;
  away_win_probability: number;
  confidence_level: string;
  confidence: number;
  reasoning: string;
  home_team: string;
  home_win_probability: number;
  predicted_score: string;
  predicted_winner: string;
  time: string;
  date: string;
  actual_score: string;
  both_team_to_score: string;
  over_two_goals: string;
  over_three_goals: string;
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
      over_three_goals: { type: "string", enum: ["Yes", "No"] },
      predicted_winner: { type: "string" },
      home_win_probability: { type: "number" },
      away_win_probability: { type: "number" },
      confidence_level: { type: "string", enum: ["low", "medium", "high"] },
      confidence: { type: "number", description: "Confidence score between 0 and 1" },
      reasoning: { type: "string", description: "Brief explanation of why this prediction was made" },
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
      "over_three_goals",
      "confidence_level",
      "confidence",
      "reasoning",
      "predicted_score"
    ],
    additionalProperties: false
  }
};

const scraper = new FootballScraper();

const leagueConfig: Record<League, {
  scraperMethod: (status?: "SCHEDULED" | "LIVE" | "FINISHED") => Promise<IBBCSoccerMatch[]>;
  model: () => typeof prisma.premierleague;
}> = {
  premierleague: {
    scraperMethod: (status) => scraper.getPremierLeagueMatches(status),
    model: () => prisma.premierleague,
  },
};
const SKIP_LLM = process.env.SKIP_LLM === "true";

/**
 * Single source of truth for the scrape → filter → predict → store pipeline.
 * Returns the full prediction array. Each route decides what subset to expose.
 */
export async function generatePredictions(league: League) {
  const config = leagueConfig[league];
  if (!config) {
    throw new Error(`Unsupported league: ${league}`);
  }

  const now = moment();
  const currentMonth = now.format("YYYY-MM");
  const model = config.model();

  // 1. Check DB for existing predictions this month
  const existingPredictions = await model.findMany({
    where: { month: currentMonth },
    orderBy: { id: "asc" },
  });

  if (existingPredictions && existingPredictions.length > 0) {
    return existingPredictions;
  }

  // 2. Scrape scheduled matches
  const matches = await config.scraperMethod("SCHEDULED");
  if (matches.length === 0) {
    return [];
  }

  // 3. Filter out played/TBC games
  const upcomingGames = matches.filter((game) => {
    const noScore = game.homeScore === undefined && game.awayScore === undefined;
    const hasTBC = game.home_team?.toLowerCase() === "tbc" || game.away_team?.toLowerCase() === "tbc";
    return noScore && !hasTBC;
  });

  if (upcomingGames.length === 0) {
    return [];
  }

  // 4. SKIP_LLM → return fixture objects without AI or DB write
  if (SKIP_LLM) {
    return upcomingGames.map((game, i) => ({
      id: i,
      game_id: generateGameId(currentMonth, game.home_team, game.away_team),
      home_team: game.home_team,
      away_team: game.away_team,
      time: game.time,
      date: game.date,
      month: currentMonth,
      predicted_score: null,
      predicted_winner: null,
      confidence_level: null,
      confidence: null,
      reasoning: null,
      actual_score: null,
    }));
  }

  // 5. Call LLM and save to DB
  const { systemMessage, userMessage } = AiDraft(upcomingGames);
  const messages = [systemMessage, userMessage];

  const llm = createLLM();
  const result = await llm.generateObject(messages, schema, 0.2);
  const predictions: ResponseResult[] = result.response;

  await model.createMany({
    data: predictions.map((pred) => ({
      game_id: generateGameId(currentMonth, pred.home_team, pred.away_team),
      home_team: pred.home_team,
      away_team: pred.away_team,
      predicted_score: pred.predicted_score,
      predicted_winner: pred.predicted_winner,
      month: currentMonth,
      home_win_probability: `${pred.home_win_probability}`,
      away_win_probability: `${pred.away_win_probability}`,
      confidence_level: pred.confidence_level,
      confidence: pred.confidence,
      reasoning: pred.reasoning,
      time: pred.time,
      date: pred.date,
      both_team_to_score: pred.both_team_to_score,
      over_two_goals: pred.over_two_goals,
      over_three_goals: pred.over_three_goals,
    })),
  });

  // 6. Re-fetch from DB so returned data has real IDs
  const saved = await model.findMany({
    where: { month: currentMonth },
    orderBy: { id: "asc" },
  });

  return saved;
}
