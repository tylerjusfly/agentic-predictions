import { EnrichedContext } from "@/services/contextAssembler";

export const AiDraft = (context: EnrichedContext) => {
  const { matches, accuracy_history } = context;

  // Build accuracy feedback block for the system prompt
  let accuracyBlock = "";
  if (accuracy_history.length > 0) {
    const lines = accuracy_history.map(
      (s) =>
        `- ${s.market}: ${Math.round(s.accuracy * 100)}% accuracy (${s.passed} correct out of ${s.passed + s.failed})`
    );
    accuracyBlock = `

Here is your past prediction accuracy over the last 3 months. Use this to calibrate your confidence — be less confident in markets where your accuracy has been low:
${lines.join("\n")}`;
  }

  const systemMessage = {
    role: "system",
    content: `You are a soccer predictions AI. Predict outcomes for each game.
Return JSON only matching the schema.
Be objective and include probabilities and scores, consider the head 2 head of the two teams.
For each prediction, provide:
- A "confidence" value between 0 and 1 representing how confident you are in the overall prediction (0 = no confidence, 1 = certain).
- A "reasoning" string briefly explaining the key factors behind your prediction (form, head-to-head, injuries, home advantage, etc).
${accuracyBlock}`
  };

  // Build match data for user prompt, including odds when available
  const matchData = matches.map((m) => {
    const entry: Record<string, any> = {
      home_team: m.home_team,
      away_team: m.away_team,
      date: m.date,
      time: m.time,
    };
    if (m.odds) {
      entry.bookmaker_odds = {
        home_win: m.odds.home_win,
        draw: m.odds.draw,
        away_win: m.odds.away_win,
        source: m.odds.bookmaker,
      };
    }
    return entry;
  });

  const userMessage = {
    role: "user",
    content: `Here are the games:

${JSON.stringify(matchData, null, 2)}

Predict outcomes as JSON.`
  };

  return { systemMessage, userMessage };
};
