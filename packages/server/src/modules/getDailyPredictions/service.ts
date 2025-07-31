import { Request, Response } from "express";
import moment from "moment";
import FootballScraper from "../../scrapers/footballScraper";
import { GeminiModel } from "../gemini/model";
import { dbAll, dbRun } from "../../utils/databaseHelpers";
import { AiDraft } from "../../utils/aiDraft";
import logger from "../../utils/logger";

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
  bts: number;
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
      bts: { type: "number" },
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
      "bts",
      "confidence_level",
      "predicted_score"
    ],
    additionalProperties: false
  }
};

const scraper = new FootballScraper();
const llm = new GeminiModel();

export const getPremierLeagueMatches = async (req: Request, res: Response): Promise<any> => {
  try {
    const now = moment();
    const currentMonth = now.format("YYYY-MM");
    // const currentMonth = "2025-08";

    const isPredictedData = (await dbAll("SELECT * FROM premierleague WHERE month = ?", [currentMonth])) as ResponseResult[];

    // return early if data exists
    if (isPredictedData && isPredictedData.length > 0) {
      return res.json({ games: isPredictedData });
    }

    // Get premierLeagues games for current month
    const todayGames = await scraper.scrapeTodaysGameFromBBC(currentMonth);

    if (todayGames.length <= 0) {
      return res.json({ games: [] });
    }

     // Remove values that has homeScore and Away scores , which means they have been played
    const upcomingGames = todayGames.filter((game) => game.homeScore === undefined && game.awayScore === undefined);

    // Optionally: check again if there's anything left
    if (upcomingGames.length === 0) {
      return res.json({ games: [] });
    }

    const { systemMessage, userMessage } = AiDraft(todayGames);

    const messages = [systemMessage, userMessage];

    const result = await llm.generateObject(messages, schema, 0.2);

    // Before Inputing it into DB add a unique identifier so we can verify fulltime score later

    const Predictions: ResponseResult[] = result.response;

    for (const pred of Predictions) {
      // getDb().run(
      await dbRun(
        `INSERT INTO premierleague (
          game_id, home_team, away_team,
          predicted_score, predicted_winner, month, home_win_probability, away_win_probability,
          confidence_level, time, date, bts
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `${currentMonth}/${pred.home_team.toLowerCase()}-${pred.away_team.toLowerCase()}`,
          pred.home_team,
          pred.away_team,
          pred.predicted_score,
          pred.predicted_winner,
          currentMonth,
          `${pred.home_win_probability}`,
          `${pred.away_win_probability}`,
          pred.confidence_level,
          pred.time,
          pred.date,
          `${pred.bts}`
        ]
      );
    }

    // await dbExec("COMMIT");
    logger.info(`Inserted ${Predictions.length} predictions`);

    return res.json({ games: Predictions });
  } catch (error: any) {
    // await dbExec("ROLLBACK");
    return res.status(500).json({ error: error.message || "server error" });
  }
};

export const getChampionsLeauge = async (req: Request, res: Response): Promise<any> => {
  try {
    const now = moment();
    const currentMonth = now.format("YYYY-MM");

    const isPredictedData = (await dbAll("SELECT * FROM championsleague WHERE month = ?", [currentMonth])) as ResponseResult[];

    // return early if data exists
    if (isPredictedData && isPredictedData.length > 0) {
      return res.json({ games: isPredictedData });
    }

    const championsGames = await scraper.scrapeChampionsLeagueFromBBC(currentMonth, false);

    if (championsGames.length <= 0) {
      return res.json({ games: [] });
    }

    // Remove values that has homeScore and Away scores , which means they have been played
    const upcomingGames = championsGames.filter((game) => game.homeScore === undefined && game.awayScore === undefined);

    // Optionally: check again if there's anything left
    if (upcomingGames.length === 0) {
      return res.json({ games: [] });
    }

    const { systemMessage, userMessage } = AiDraft(championsGames);

    const messages = [systemMessage, userMessage];

    const result = await llm.generateObject(messages, schema, 0.5);

    const Predictions: ResponseResult[] = result.response;

    for (const pred of Predictions) {
      await dbRun(
        `INSERT INTO championsleague (
          game_id, home_team, away_team,
          predicted_score, predicted_winner, month, home_win_probability, away_win_probability,
          confidence_level, time, date, bts
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `${currentMonth}/${pred.home_team.toLowerCase()}-${pred.away_team.toLowerCase()}`,
          pred.home_team,
          pred.away_team,
          pred.predicted_score,
          pred.predicted_winner,
          currentMonth,
          `${pred.home_win_probability}`,
          `${pred.away_win_probability}`,
          pred.confidence_level,
          pred.time,
          pred.date,
          `${pred.bts}`
        ]
      );
    }

    return res.json({ games: Predictions });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "server error" });
  }
};
