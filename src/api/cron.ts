import { request } from "@/lib/request";

export const updatePremierLeaguesGames = async (): Promise<{ success: boolean }> => {
    return await request("api/cron/scrape-and-predict", "GET", null);
  };