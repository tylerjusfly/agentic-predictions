import { Request, Response } from "express";
import moment from "moment";
import FootballScraper from "../../scrapers/footballScraper";
import { GeminiModel } from "../gemini/model";
import { dbAll, dbRun } from "../../utils/databaseHelpers";
import { AiDraft } from "../../utils/aiDraft";
import logger from "../../utils/logger";

export type ResponseResult = {
  awayTeam: string;
  awayWinProbability: number;
  confidenceLevel: string;
  homeTeam: string;
  homeWinProbability: number;
  predictedScore: string;
  predictedWinner: string;
  time: string;
  date: string;
  actual_score: string;
  bothTeamsToScoreProbability: number;
};

const schema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      homeTeam: { type: "string" },
      awayTeam: { type: "string" },
      date: { type: "string" },
      time: { type: "string" },
      bothTeamsToScoreProbability: { type: "number" },
      predictedWinner: { type: "string" },
      homeWinProbability: { type: "number" },
      awayWinProbability: { type: "number" },
      confidenceLevel: { type: "string", enum: ["low", "medium", "high"] },
      predictedScore: { type: "string" }
    },
    required: [
      "homeTeam",
      "awayTeam",
      "date",
      "time",
      "predictedWinner",
      "homeWinProbability",
      "awayWinProbability",
      "bothTeamsToScoreProbability",
      "confidenceLevel",
      "predictedScore"
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

    const isPredictedData = (await dbAll("SELECT * FROM predictions WHERE month = ?", [currentMonth])) as ResponseResult[];

    // return early if data exists
    if (isPredictedData && isPredictedData.length > 0) {
      return res.json({ games: isPredictedData });
    }

    // Get premierLeagues games for current month
    const todayGames = await scraper.scrapeTodaysGameFromBBC(currentMonth);

    if(todayGames.length <= 0){
      return res.json({ games: [] });
    }

    // fetch data regarding the games so LLM can predict scores accurately
    //  const collection = await chromaClient.getCollection({ name: "predictions" });

    // 2. Retrieve similar documents
    // const searchResult = await collection.query({
    //   // queryEmbeddings: JSON.stringify(todayGames),
    //   queryTexts: JSON.stringify(todayGames),
    //   nResults: 10,
    // });

    const { systemMessage, userMessage } = AiDraft(todayGames);

    const messages = [systemMessage, userMessage];

    const result = await llm.generateObject(messages, schema, 0.2);

    // Before Inputing it into DB add a unique identifier so we can verify fulltime score later

    const Predictions: ResponseResult[] = result.response;

    for (const pred of Predictions) {
      // getDb().run(
      await dbRun(
        `INSERT INTO predictions (
          game_id, home_team, away_team,
          predicted_score, predicted_winner, month, home_win_probability, away_win_probability,
          confidence_level, time, date, bts
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `${currentMonth}/${pred.homeTeam.toLowerCase()}-${pred.awayTeam.toLowerCase()}`,
          pred.homeTeam,
          pred.awayTeam,
          pred.predictedScore,
          pred.predictedWinner,
          currentMonth,
          `${pred.homeWinProbability}`,
          `${pred.awayWinProbability}`,
          pred.confidenceLevel,
          pred.time,
          pred.date,
          `${pred.bothTeamsToScoreProbability}`
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

     if(championsGames.length <= 0){
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
          `${currentMonth}/${pred.homeTeam.toLowerCase()}-${pred.awayTeam.toLowerCase()}`,
          pred.homeTeam,
          pred.awayTeam,
          pred.predictedScore,
          pred.predictedWinner,
          currentMonth,
          `${pred.homeWinProbability}`,
          `${pred.awayWinProbability}`,
          pred.confidenceLevel,
          pred.time,
          pred.date,
          `${pred.bothTeamsToScoreProbability}`
        ]
      );
    }

    return res.json({ games: Predictions });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "server error" });
  }
};