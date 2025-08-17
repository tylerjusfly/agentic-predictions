import moment from "moment";
import { ResponseResult } from "@/app/api/premier-league/route";
import FootballScraper from "@/lib/FootballScraper";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";

type Imodel = "premierleague" | "championsleague";

const modelMap = {
  premierleague: prisma.premierleague,
  championsleague: prisma.championsleague
  // add other models here
} as const;

const scraper = new FootballScraper();

export type ExtResponseResult = ResponseResult & {
  month: string;
  game_id: string;
};

interface UpdateResultsOptions {
  tableName: Imodel;
  scraperMethod: keyof FootballScraper; // method name in FootballScraper
}

export const updateCompetitionResults = async ({ tableName, scraperMethod }: UpdateResultsOptions) => {
  try {
    const now = moment();
    const currentMonth = now.format("YYYY-MM");

    // Dynamically call scraper method
    if (typeof scraper[scraperMethod] !== "function") {
      throw new Error(`Scraper method "${scraperMethod}" not found`);
    }
    const results = await scraper[scraperMethod](currentMonth, true);

    if (!results.length) {
      logger.info(`[${tableName}] Skipped update because no game was played today.`);
      return;
    }

    // 🔥 use dynamic Prisma model
    const model = modelMap[tableName as keyof typeof modelMap];
    if (!model) {
      logger.error(`Invalid table name: ${tableName}`);
      return;
    }

    // Get games without scores
    const existingScores = (await (model as any).findMany({
      where: {
        month: currentMonth,
        actual_score: null // NULL check in Prisma
      },
      select: {
        game_id: true,
        actual_score: true
      }
    })) as Pick<ExtResponseResult, "game_id" | "actual_score">[];

    const existingGameIds = new Set(existingScores.map((score) => score.game_id));

    // Filter only played games that match existing records
    const gamesPlayedToday = results
      .map((match) => ({
        ...match,
        game_id: `${currentMonth}/${match.home_team.toLowerCase()}-${match.away_team.toLowerCase()}`
      }))
      .filter((match) => existingGameIds.has(match.game_id) && !(match.homeScore === undefined && match.awayScore === undefined));

    if (!gamesPlayedToday.length) {
      logger.info(`[${tableName}] No matching games found to update.`);
      return;
    }

    console.log(gamesPlayedToday);

    // Batch update scores
    const updates = gamesPlayedToday
      .filter((g) => g.homeScore !== undefined && g.awayScore !== undefined)
      .map((g) =>
        (model as any).update({
          where: { game_id: g.game_id },
          data: { actual_score: `${g.homeScore}-${g.awayScore}` }
        })
      );

    // run as a single transaction
    await prisma.$transaction(updates);

    logger.info(`[${tableName}] Successfully updated ${gamesPlayedToday.length} games.`);
  } catch (error: any) {
    logger.error(`Error updating ${tableName} results: ${error.message}`);
    // Optional: send notification about error
  }
};
