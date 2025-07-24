import { Request, Response } from "express";
import moment from "moment";

import { dbAll } from "../../utils/databaseHelpers";

import { ResponseResult } from "../getDailyPredictions/service";

export default class PublicAPIService {

  public getPublicPremierLeagueMatches = async (req: Request, res: Response): Promise<any> => {
    try {
      const now = moment();
      const currentMonth = now.format("YYYY-MM");
  
      const PredictedData = (await dbAll(
        "SELECT id, game_id, home_team, away_team, confidence_level, time, date, actual_score FROM predictions WHERE month = ? LIMIT 5",
        [currentMonth]
      )) as ResponseResult[];
  
  
      return res.json({ games: PredictedData });
    } catch (error: any) {
  
      return res.status(500).json({ error: error.message || "server error" });
    }
  };

   public getPublicChampionsMatches = async (req: Request, res: Response): Promise<any> => {
    try {
      const now = moment();
      const currentMonth = now.format("YYYY-MM");
  
      const PredictedData = (await dbAll(
        "SELECT id, game_id, home_team, away_team, confidence_level, time, date, actual_score FROM championsleague WHERE month = ? LIMIT 5",
        [currentMonth]
      )) as ResponseResult[];
  
  
      return res.json({ games: PredictedData });
    } catch (error: any) {
  
      return res.status(500).json({ error: error.message || "server error" });
    }
  }
}

