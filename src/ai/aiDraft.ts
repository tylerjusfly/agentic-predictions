import { IBBCSoccerMatch } from "@/lib/FootballScraper";

export const AiDraft = (todayGames: IBBCSoccerMatch[]) => {
        const systemMessage = {
      role: "system",
      content: `
You are a soccer predictions AI. Predict outcomes for each game.
Return JSON only matching the schema.
Be objective and include probabilities and scores, consider the head 2 head of the two teams.
`
    };
    const userMessage = {
      role: "user",
      content: `Here are the games:

${JSON.stringify(todayGames, null, 2)}

Predict outcomes as JSON.`
    };

    return { systemMessage, userMessage }
}