import { ResponseResult } from "./predictionService";
import { PredictionHeadName } from "@/ai/schemas";
import { canonicalize } from "@/lib/teamNames";
import logger from "@/lib/logger";

export type ScoreHeadResult = {
  home_team: string; away_team: string; date: string; time: string;
  predicted_score: string;
};

export type WinnerHeadResult = {
  home_team: string; away_team: string; date: string; time: string;
  predicted_winner: string;
  home_win_probability: number;
  away_win_probability: number;
  confidence_level: string;
  confidence: number;
  reasoning: string;
};

export type BttsHeadResult = {
  home_team: string; away_team: string; date: string; time: string;
  both_team_to_score: string;
};

export type GoalsHeadResult = {
  home_team: string; away_team: string; date: string; time: string;
  over_two_goals: string;
  over_three_goals: string;
};

export type HeadResultMap = {
  score: ScoreHeadResult[];
  winner: WinnerHeadResult[];
  btts: BttsHeadResult[];
  goals: GoalsHeadResult[];
};

function matchKey(home: string, away: string): string {
  return `${canonicalize(home)}-vs-${canonicalize(away)}`;
}

const DEFAULTS = {
  predicted_score: "0-0",
  predicted_winner: "draw",
  home_win_probability: 0.33,
  away_win_probability: 0.33,
  confidence_level: "low",
  confidence: 0.3,
  reasoning: "Insufficient data for this prediction head.",
  both_team_to_score: "No",
  over_two_goals: "No",
  over_three_goals: "No",
};

export function mergeHeadResults(results: Partial<HeadResultMap>): ResponseResult[] {
  // Determine anchor head (first available in priority order)
  const anchorOrder: PredictionHeadName[] = ["winner", "score", "btts", "goals"];
  let anchorMatches: Array<{ home_team: string; away_team: string; date: string; time: string }> = [];

  for (const head of anchorOrder) {
    const headResults = results[head];
    if (headResults && headResults.length > 0) {
      anchorMatches = headResults;
      break;
    }
  }

  if (anchorMatches.length === 0) {
    logger.warn("[ResultMerger] No head returned any results.");
    return [];
  }

  // Index each head's results by match key
  const scoreMap = new Map<string, ScoreHeadResult>();
  const winnerMap = new Map<string, WinnerHeadResult>();
  const bttsMap = new Map<string, BttsHeadResult>();
  const goalsMap = new Map<string, GoalsHeadResult>();

  for (const r of results.score ?? []) scoreMap.set(matchKey(r.home_team, r.away_team), r);
  for (const r of results.winner ?? []) winnerMap.set(matchKey(r.home_team, r.away_team), r);
  for (const r of results.btts ?? []) bttsMap.set(matchKey(r.home_team, r.away_team), r);
  for (const r of results.goals ?? []) goalsMap.set(matchKey(r.home_team, r.away_team), r);

  return anchorMatches.map((match) => {
    const key = matchKey(match.home_team, match.away_team);
    const score = scoreMap.get(key);
    const winner = winnerMap.get(key);
    const btts = bttsMap.get(key);
    const goals = goalsMap.get(key);

    return {
      home_team: match.home_team,
      away_team: match.away_team,
      date: match.date,
      time: match.time,
      predicted_score: score?.predicted_score ?? DEFAULTS.predicted_score,
      predicted_winner: winner?.predicted_winner ?? DEFAULTS.predicted_winner,
      home_win_probability: winner?.home_win_probability ?? DEFAULTS.home_win_probability,
      away_win_probability: winner?.away_win_probability ?? DEFAULTS.away_win_probability,
      confidence_level: winner?.confidence_level ?? DEFAULTS.confidence_level,
      confidence: winner?.confidence ?? DEFAULTS.confidence,
      reasoning: winner?.reasoning ?? DEFAULTS.reasoning,
      both_team_to_score: btts?.both_team_to_score ?? DEFAULTS.both_team_to_score,
      over_two_goals: goals?.over_two_goals ?? DEFAULTS.over_two_goals,
      over_three_goals: goals?.over_three_goals ?? DEFAULTS.over_three_goals,
      actual_score: "",
    };
  });
}
