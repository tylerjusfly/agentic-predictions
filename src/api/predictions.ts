import { request } from "../lib/request";

export type IPrediction = {
    id: number;
    game_id: string;
    home_team: string;
    away_team: string;
    predicted_score: string;
    predicted_winner: string;
    month: string;
    time: string;
    date: string;
    bts: string;
    home_win_probability: string;
    away_win_probability: string;
    confidence_level: string;
    actual_score: null | string;
    created_at: string;
  }

type Ires = {
  games: IPrediction[];
};

export const getPremierLeagues = async (): Promise<Ires> => {
  return await request("api/premier-league", "GET", null);
};

export const getChampionsLeagues = async (): Promise<Ires> => {
  return await request("api/premier-league", "GET", null);
};


// PRO ROUTE
export const getPremierLeaguesPro = async (): Promise<Ires> => {
  return await request("api/premier-league", "GET", null);
};

export const getChampionsLeaguesPro = async (): Promise<Ires> => {
  return await request("v1/monthly/get-championsLeague", "GET", null);
};