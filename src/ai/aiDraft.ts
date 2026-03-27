import { IBBCSoccerMatch } from "@/lib/FootballScraper";

export const AiDraft = (todayGames: IBBCSoccerMatch[]) => {
        const systemMessage = {
      role: "system",
      content: `
You are a soccer predictions AI. Predict outcomes for each game.
Return JSON only matching the schema.
Be objective and include probabilities and scores, consider the head 2 head of the two teams.
For each prediction, provide:
- A "confidence" value between 0 and 1 representing how confident you are in the overall prediction (0 = no confidence, 1 = certain).
- A "reasoning" string briefly explaining the key factors behind your prediction (form, head-to-head, injuries, home advantage, etc).
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