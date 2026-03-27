import { EnrichedContext, AccuracySignal } from "@/services/contextAssembler";
import { PredictionHeadName } from "./schemas";
import { EmphasisLevel, HeadStrategy } from "@/services/strategySelector";

type PromptPair = {
  systemMessage: { role: string; content: string };
  userMessage: { role: string; content: string };
};

const EMPHASIS_INSTRUCTIONS: Record<EmphasisLevel, string> = {
  aggressive:
    "Your recent accuracy on this market has been strong. Be decisive and commit to your predictions with higher confidence where warranted.",
  normal:
    "Provide balanced, well-reasoned predictions. Weigh all available evidence evenly.",
  conservative:
    "Your recent accuracy on this market has been below expectations. Be cautious: consider unlikely outcomes, hedge your predictions, and prefer lower confidence levels unless the evidence is overwhelming.",
  disabled: "",
};

const DEFAULT_SYSTEM_PROMPTS: Record<PredictionHeadName, string> = {
  score: `You are a soccer score prediction specialist. For each match, predict the exact final score.

Think step by step:
1. Consider the attacking and defensive strength of each team based on recent form.
2. Factor in home advantage and head-to-head history.
3. Consider the bookmaker odds provided (if available) as a market signal.
4. Arrive at the most likely exact scoreline.

{{emphasis_instruction}}

{{accuracy_block}}

Return JSON only matching the schema.`,

  winner: `You are a soccer match outcome prediction specialist. For each match, predict the winner (or draw) along with win probabilities.

Think step by step:
1. Assess recent form, league position, and momentum for each team.
2. Factor in home advantage — the home team has a statistical edge.
3. Consider the bookmaker odds provided (if available) as a market calibration.
4. Consider head-to-head record between these two teams.
5. Provide calibrated probabilities (home_win + draw_implied + away_win should approximate 1.0).
6. Explain your reasoning concisely.

{{emphasis_instruction}}

{{accuracy_block}}

Return JSON only matching the schema. The "predicted_winner" field should be the team name (home_team or away_team) or "draw".`,

  btts: `You are a soccer goals analysis specialist focused on whether both teams will score (BTTS).

Think step by step:
1. Assess the attacking quality of each team — do they regularly find the net?
2. Assess the defensive quality — do they often keep clean sheets?
3. Consider the matchup: a strong attack vs a weak defense increases BTTS likelihood.
4. Factor in the bookmaker odds and recent scoring patterns.

{{emphasis_instruction}}

{{accuracy_block}}

Return JSON only matching the schema. Respond with "Yes" or "No" for both_team_to_score.`,

  goals: `You are a soccer goals analysis specialist focused on total goals in a match.

Think step by step:
1. Consider the average goals per game for each team (both scored and conceded).
2. Factor in the matchup dynamics — high-scoring teams vs defensive teams.
3. Consider the context (relegation battles tend to be tighter; top teams often produce more goals).
4. Use bookmaker odds as a calibration signal if available.

{{emphasis_instruction}}

{{accuracy_block}}

Return JSON only matching the schema. over_two_goals means total goals > 2. over_three_goals means total goals > 3.`,
};

const HEAD_MARKETS: Record<PredictionHeadName, string[]> = {
  score: ["correct_score"],
  winner: ["straight_win", "draw"],
  btts: ["btts"],
  goals: ["over_2.5_goals"],
};

function buildAccuracyBlock(head: PredictionHeadName, accuracyHistory: AccuracySignal[]): string {
  const markets = HEAD_MARKETS[head];
  const relevant = accuracyHistory.filter((s) => markets.includes(s.market));

  if (relevant.length === 0) return "";

  const lines = relevant.map(
    (s) =>
      `- ${s.market}: ${Math.round(s.accuracy * 100)}% accuracy (${s.passed} correct out of ${s.passed + s.failed})`
  );

  return `Here is your past prediction accuracy for this market over the last 3 months:\n${lines.join("\n")}`;
}

function buildUserMessage(context: EnrichedContext): { role: string; content: string } {
  const matchData = context.matches.map((m) => {
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

  return {
    role: "user",
    content: `Here are the matches:\n\n${JSON.stringify(matchData, null, 2)}\n\nPredict outcomes as JSON.`,
  };
}

export function buildHeadPrompt(
  head: PredictionHeadName,
  strategy: HeadStrategy,
  context: EnrichedContext,
  dbSystemPrompt?: string | null,
  globalPreamble?: string | null
): PromptPair {
  const template = dbSystemPrompt || DEFAULT_SYSTEM_PROMPTS[head];
  const emphasisInstruction = EMPHASIS_INSTRUCTIONS[strategy.emphasis];
  const accuracyBlock = buildAccuracyBlock(head, context.accuracy_history);

  let systemContent = template
    .replace("{{emphasis_instruction}}", emphasisInstruction)
    .replace("{{accuracy_block}}", accuracyBlock);

  if (globalPreamble) {
    systemContent = globalPreamble + "\n\n" + systemContent;
  }

  return {
    systemMessage: { role: "system", content: systemContent },
    userMessage: buildUserMessage(context),
  };
}
