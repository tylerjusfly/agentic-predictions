import axios from "axios";
import * as cheerio from "cheerio";

interface Headers {
  [key: string]: string;
}

export type IBBCSoccerMatch = {
  home_team: string;
  away_team: string;
  time: string | null;
  source: string;
  date: string;
  homeScore: number | undefined;
  awayScore: number | undefined;
};

class FootballScraper {
  baseHeaders: Headers;

  constructor() {
    this.baseHeaders = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1"
    };
  }

  async scrapeChampionsLeagueFromBBC(month: string, findScores: boolean) {
    console.log("🔍 Scraping from BBC...");
    const matches: IBBCSoccerMatch[] = [];

    try {
      const url = `https://www.bbc.com/sport/football/champions-league/scores-fixtures/${month}?filter=${findScores ? "results" : "fixtures"}`;

      const response = await axios.get(url, {
        headers: this.baseHeaders,
        timeout: 10000
      });

      const $ = cheerio.load(response.data);

      $(".ssrcss-1ox7t1a-Container.ea54ukl1").each((_, dayEl) => {
        const dayContainer = $(dayEl);

        // Extract the date
        const dateText = dayContainer.find("h2.ssrcss-12l0oeb-GroupHeader.ejnn8gi5").text().trim();

        // Find all games under this date
        dayContainer.find("li.ssrcss-18nzily-HeadToHeadWrapper.e1dih4s32").each((_, li) => {
          const liEl = $(li);

          // home team
          const homeTeam = liEl
            .find(".ssrcss-bon2fo-WithInlineFallback-TeamHome .ssrcss-c8w0oz-MobileValue")
            .first()
            .text()
            .trim();

          // away team
          const awayTeam = liEl
            .find(".ssrcss-nvj22c-WithInlineFallback-TeamAway .ssrcss-c8w0oz-MobileValue")
            .first()
            .text()
            .trim();

          // time
          const time = liEl.find("time.ssrcss-bkk8ek-StyledTime.eli9aj90").first().text().trim();

          // Try to find scores
          const homeScoreText = liEl.find(".ssrcss-qsbptj-HomeScore.e56kr2l2").first().text().trim();

          const awayScoreText = liEl.find(".ssrcss-fri5a2-AwayScore.e56kr2l1").first().text().trim();

          // Convert to numbers or undefined
          const homeScore = homeScoreText ? parseInt(homeScoreText, 10) : undefined;
          const awayScore = awayScoreText ? parseInt(awayScoreText, 10) : undefined;

          matches.push({
            date: dateText,
            home_team: homeTeam,
            away_team :awayTeam,
            time: time || null,
            homeScore,
            awayScore,
            source: "BBC"
          });
        });
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.warn("Failed to scrape ESPN:", error);
    }

    return matches;
  }

  async scrapePremierLeagueGameFromBBC(month: string, findScores: boolean) {
    console.log("🔍 Scraping from BBC...");
    const matches: IBBCSoccerMatch[] = [];

    try {

       const url = `https://www.bbc.com/sport/football/premier-league/scores-fixtures/${month}?filter=${findScores ? "results" : "fixtures"}`;
       
      // const url = `https://www.bbc.com/sport/football/premier-league/scores-fixtures/${month}`;

      const response = await axios.get(url, {
        headers: this.baseHeaders,
        timeout: 10000
      });

      const $ = cheerio.load(response.data);

      // Loop through all day containers
      $(".ssrcss-1ox7t1a-Container.ea54ukl1").each((_, dayEl) => {
        const dayContainer = $(dayEl);

        // Extract the date
        const dateText = dayContainer.find("h2.ssrcss-12l0oeb-GroupHeader.ejnn8gi5").text().trim();

        // Find all games under this date
        dayContainer.find("li.ssrcss-18nzily-HeadToHeadWrapper.e1dih4s32").each((_, li) => {
          const liEl = $(li);

          // home team
          const homeTeam = liEl
            .find(".ssrcss-bon2fo-WithInlineFallback-TeamHome .ssrcss-c8w0oz-MobileValue")
            .first()
            .text()
            .trim();

          // away team
          const awayTeam = liEl
            .find(".ssrcss-nvj22c-WithInlineFallback-TeamAway .ssrcss-c8w0oz-MobileValue")
            .first()
            .text()
            .trim();

          // time
          const time = liEl.find("time.ssrcss-bkk8ek-StyledTime.eli9aj90").first().text().trim();

          // Try to find scores
          const homeScoreText = liEl.find(".ssrcss-qsbptj-HomeScore.e56kr2l2").first().text().trim();

          const awayScoreText = liEl.find(".ssrcss-fri5a2-AwayScore.e56kr2l1").first().text().trim();

          // Convert to numbers or undefined
          const homeScore = homeScoreText ? parseInt(homeScoreText, 10) : undefined;
          const awayScore = awayScoreText ? parseInt(awayScoreText, 10) : undefined;

          matches.push({
            date: dateText,
            home_team: homeTeam,
            away_team: awayTeam,
            time: time || null,
            homeScore,
            awayScore,
            source: "BBC"
          });
        });
      });

      return matches;
    } catch (error) {
      console.warn("Failed to scrape BBC:", error);
      return [];
    }
  }
}

export default FootballScraper;
