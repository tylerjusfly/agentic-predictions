import { AccuracySignal } from "./contextAssembler";
import { PredictionHeadName } from "@/ai/schemas";

export type EmphasisLevel = "aggressive" | "normal" | "conservative" | "disabled";

export type HeadStrategy = {
  head: PredictionHeadName;
  emphasis: EmphasisLevel;
  temperature: number;
};

export type ConfigOverrides = {
  score_emphasis?: string;
  winner_emphasis?: string;
  btts_emphasis?: string;
  goals_emphasis?: string;
  score_temperature?: number | null;
  winner_temperature?: number | null;
  btts_temperature?: number | null;
  goals_temperature?: number | null;
};

const MARKET_TO_HEAD: Record<string, PredictionHeadName> = {
  correct_score: "score",
  straight_win: "winner",
  draw: "winner",
  btts: "btts",
  "over_2.5_goals": "goals",
};

const DEFAULT_TEMPERATURE = 0.2;
const HIGH_ACCURACY_THRESHOLD = 0.65;
const LOW_ACCURACY_THRESHOLD = 0.40;

export function selectStrategies(
  accuracyHistory: AccuracySignal[],
  configOverrides?: ConfigOverrides
): HeadStrategy[] {
  // Build accuracy lookup: head → averaged accuracy
  const headAccuracies = new Map<PredictionHeadName, number[]>();

  for (const signal of accuracyHistory) {
    const head = MARKET_TO_HEAD[signal.market];
    if (!head) continue;
    const existing = headAccuracies.get(head) || [];
    existing.push(signal.accuracy);
    headAccuracies.set(head, existing);
  }

  const heads: PredictionHeadName[] = ["score", "winner", "btts", "goals"];

  return heads.map((head) => {
    const emphasisKey = `${head}_emphasis` as keyof ConfigOverrides;
    const tempKey = `${head}_temperature` as keyof ConfigOverrides;
    const configEmphasis = configOverrides?.[emphasisKey] as EmphasisLevel | undefined;
    const configTemp = configOverrides?.[tempKey] as number | null | undefined;
    const temperature = configTemp ?? DEFAULT_TEMPERATURE;

    // Config override takes precedence
    if (configEmphasis && configEmphasis !== "normal") {
      return { head, emphasis: configEmphasis, temperature };
    }

    // Derive emphasis from accuracy history
    const accuracies = headAccuracies.get(head);
    let emphasis: EmphasisLevel = "normal";

    if (accuracies && accuracies.length > 0) {
      const avg = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
      if (avg >= HIGH_ACCURACY_THRESHOLD) {
        emphasis = "aggressive";
      } else if (avg < LOW_ACCURACY_THRESHOLD) {
        emphasis = "conservative";
      }
    }

    return { head, emphasis, temperature };
  });
}
