import moment from "moment";
import FootballScraper, { IBBCSoccerMatch } from "@/lib/FootballScraper";
import { createLLM } from "@/ai/model";
import prisma from "@/lib/prisma";
import { generateGameId } from "@/lib/teamNames";
import { assembleContext } from "./contextAssembler";
import { selectStrategies } from "./strategySelector";
import { buildHeadPrompt } from "@/ai/promptBuilder";
import { HEAD_SCHEMAS } from "@/ai/schemas";
import { mergeHeadResults, HeadResultMap } from "./resultMerger";
import logger from "@/lib/logger";

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

  // 5. Load prompt config from DB (or use defaults)
  const promptConfig = await prisma.promptConfig.findFirst({
    where: { league, active: true },
    orderBy: { version: "desc" },
  });

  // 6. Assemble enriched context
  const enrichedContext = await assembleContext(upcomingGames, league);

  // 7. Select strategies based on accuracy + config
  const strategies = selectStrategies(
    enrichedContext.accuracy_history,
    promptConfig ? {
      score_emphasis: promptConfig.score_emphasis,
      winner_emphasis: promptConfig.winner_emphasis,
      btts_emphasis: promptConfig.btts_emphasis,
      goals_emphasis: promptConfig.goals_emphasis,
      score_temperature: promptConfig.score_temperature,
      winner_temperature: promptConfig.winner_temperature,
      btts_temperature: promptConfig.btts_temperature,
      goals_temperature: promptConfig.goals_temperature,
    } : undefined
  );

  // 8. Run enabled heads in parallel
  const llm = createLLM();
  const enabledStrategies = strategies.filter((s) => s.emphasis !== "disabled");

  const headResults = await Promise.allSettled(
    enabledStrategies.map(async (strategy) => {
      const promptKey = `${strategy.head}_system_prompt` as keyof typeof promptConfig;
      const dbPrompt = promptConfig?.[promptKey] as string | undefined;

      const { systemMessage, userMessage } = buildHeadPrompt(
        strategy.head,
        strategy,
        enrichedContext,
        dbPrompt,
        promptConfig?.global_preamble,
      );

      const result = await llm.generateObject(
        [systemMessage, userMessage],
        HEAD_SCHEMAS[strategy.head],
        strategy.temperature,
      );

      return { head: strategy.head, data: result.response };
    })
  );

  // 9. Collect results, log failures
  const resultMap: Partial<HeadResultMap> = {};
  for (let i = 0; i < enabledStrategies.length; i++) {
    const outcome = headResults[i];
    const head = enabledStrategies[i].head;
    if (outcome.status === "fulfilled") {
      resultMap[head] = outcome.value.data;
    } else {
      logger.error(`[PredictionService] Head "${head}" failed: ${outcome.reason}`);
    }
  }

  // 10. Merge head results into ResponseResult[]
  const predictions = mergeHeadResults(resultMap);

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
