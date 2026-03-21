import axios from "axios";

export type IBBCSoccerMatch = {
  home_team: string;
  away_team: string;
  time: string | null;
  source: string;
  date: string;
  homeScore: number | undefined;
  awayScore: number | undefined;
};

// League ID mappings for football-data.org
const LEAGUE_IDS: { [key: string]: string } = {
  "Premier League": "PL",
  "champions-league": "CL",
  "Champions League": "CL",
  "La Liga": "LA",
  "Ligue 1": "FL1",
  "Serie A": "SA",
  "Bundesliga": "BL1",
};

class FootballScraper {
  private baseUrl = "https://api.football-data.org/v4";
  private apiKey = process.env.FOOTBALL_DATA_API_KEY || "";

  constructor() {
    if (!this.apiKey) {
      console.warn("⚠️ FOOTBALL_DATA_API_KEY is not set. API calls may fail.");
    }
  }

  /**
   * Reusable method to fetch matches for any league
   * @param leagueName - The name of the league (e.g., "Premier League", "Champions League")
   * @param status - Filter by status: "SCHEDULED", "LIVE", "FINISHED", or leave undefined for all
   * @returns Array of matches formatted as IBBCSoccerMatch
   */
  async getLeagueMatches(leagueName: string, status?: "SCHEDULED" | "LIVE" | "FINISHED"): Promise<IBBCSoccerMatch[]> {
    console.log(`🔍 Fetching ${leagueName} matches from football-data.org...`);
    const matches: IBBCSoccerMatch[] = [];

    try {
      const leagueId = LEAGUE_IDS[leagueName];
      if (!leagueId) {
        console.warn(`⚠️ League "${leagueName}" not found in supported leagues.`);
        return [];
      }

      let url = `${this.baseUrl}/competitions/${leagueId}/matches`;
      const params: { [key: string]: string } = {};

      if (status) {
        params.status = status;
      }

      const response = await axios.get(url, {
        headers: {
          "X-Auth-Token": this.apiKey
        },
        params,
        timeout: 10000
      });

      const data = response.data;

      if (data.matches && Array.isArray(data.matches)) {
        data.matches.forEach((match: any) => {
          matches.push({
            date: new Date(match.utcDate).toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric"
            }),
            home_team: match.homeTeam.name,
            away_team: match.awayTeam.name,
            time: match.utcDate ? new Date(match.utcDate).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "UTC"
            }) : null,
            homeScore: match.score.fullTime.home ?? undefined,
            awayScore: match.score.fullTime.away ?? undefined,
            source: "football-data.org"
          });
        });
      }

      return matches;
    } catch (error: any) {
      console.error(`❌ Failed to fetch ${leagueName} matches:`, error.message);
      if (error.response?.status === 403) {
        console.error("API Key might be invalid or expired.");
      }
      return [];
    }
  }

  /**
   * Convenience method for Premier League matches
   * @param status - Filter by status: "SCHEDULED", "LIVE", "FINISHED"
   * @returns Array of Premier League matches
   */
  async getPremierLeagueMatches(status?: "SCHEDULED" | "LIVE" | "FINISHED"): Promise<IBBCSoccerMatch[]> {
    return this.getLeagueMatches("Premier League", status);
  }

  /**
   * Convenience method for Champions League matches
   * @param status - Filter by status: "SCHEDULED", "LIVE", "FINISHED"
   * @returns Array of Champions League matches
   */
  async getChampionsLeagueMatches(status?: "SCHEDULED" | "LIVE" | "FINISHED"): Promise<IBBCSoccerMatch[]> {
    return this.getLeagueMatches("Champions League", status);
  }

  /**
   * Get all supported leagues
   * @returns Object with league names and their IDs
   */
  getSupportedLeagues(): { [key: string]: string } {
    return LEAGUE_IDS;
  }
}

export default FootballScraper;
