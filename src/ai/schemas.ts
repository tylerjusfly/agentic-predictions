export type PredictionHeadName = "score" | "winner" | "btts" | "goals";

export const scoreHeadSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      home_team: { type: "string" },
      away_team: { type: "string" },
      date: { type: "string" },
      time: { type: "string" },
      predicted_score: { type: "string", description: "e.g. '2-1'" },
    },
    required: ["home_team", "away_team", "date", "time", "predicted_score"],
    additionalProperties: false,
  },
};

export const winnerHeadSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      home_team: { type: "string" },
      away_team: { type: "string" },
      date: { type: "string" },
      time: { type: "string" },
      predicted_winner: { type: "string" },
      home_win_probability: { type: "number" },
      away_win_probability: { type: "number" },
      confidence_level: { type: "string", enum: ["low", "medium", "high"] },
      confidence: { type: "number", description: "Confidence score between 0 and 1" },
      reasoning: { type: "string", description: "Brief explanation of prediction factors" },
    },
    required: [
      "home_team", "away_team", "date", "time",
      "predicted_winner", "home_win_probability", "away_win_probability",
      "confidence_level", "confidence", "reasoning",
    ],
    additionalProperties: false,
  },
};

export const bttsHeadSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      home_team: { type: "string" },
      away_team: { type: "string" },
      date: { type: "string" },
      time: { type: "string" },
      both_team_to_score: { type: "string", enum: ["Yes", "No"] },
    },
    required: ["home_team", "away_team", "date", "time", "both_team_to_score"],
    additionalProperties: false,
  },
};

export const goalsHeadSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      home_team: { type: "string" },
      away_team: { type: "string" },
      date: { type: "string" },
      time: { type: "string" },
      over_two_goals: { type: "string", enum: ["Yes", "No"] },
      over_three_goals: { type: "string", enum: ["Yes", "No"] },
    },
    required: ["home_team", "away_team", "date", "time", "over_two_goals", "over_three_goals"],
    additionalProperties: false,
  },
};

export const HEAD_SCHEMAS: Record<PredictionHeadName, object> = {
  score: scoreHeadSchema,
  winner: winnerHeadSchema,
  btts: bttsHeadSchema,
  goals: goalsHeadSchema,
};
