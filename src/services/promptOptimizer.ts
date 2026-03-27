import moment from "moment";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { EmphasisLevel } from "./strategySelector";

// ─── Types ────────────────────────────────────────────────

type MarketEmphasisKey = "score_emphasis" | "winner_emphasis" | "btts_emphasis" | "goals_emphasis";
type MarketTemperatureKey = "score_temperature" | "winner_temperature" | "btts_temperature" | "goals_temperature";

type Adaptation = {
  market: string;
  emphasisKey: MarketEmphasisKey;
  temperatureKey: MarketTemperatureKey;
  newEmphasis: EmphasisLevel;
  newTemperature: number;
  reason: string;
};

// ─── Market Mapping ───────────────────────────────────────

const MARKET_TO_CONFIG: Record<string, { emphasisKey: MarketEmphasisKey; temperatureKey: MarketTemperatureKey }> = {
  straight_win: { emphasisKey: "winner_emphasis", temperatureKey: "winner_temperature" },
  draw: { emphasisKey: "winner_emphasis", temperatureKey: "winner_temperature" },
  btts: { emphasisKey: "btts_emphasis", temperatureKey: "btts_temperature" },
  over_2_goals: { emphasisKey: "goals_emphasis", temperatureKey: "goals_temperature" },
  over_3_goals: { emphasisKey: "goals_emphasis", temperatureKey: "goals_temperature" },
  correct_score: { emphasisKey: "score_emphasis", temperatureKey: "score_temperature" },
};

// ─── Adaptation Rules ─────────────────────────────────────

const SEVERE_DROP = 0.30;
const MODERATE_DROP = 0.40;
const DEFAULT_TEMPERATURE = 0.2;
const CONSERVATIVE_TEMPERATURE = 0.15;
const MAX_VERSIONS_PER_DAY = 2;

function determineAdaptation(
  market: string,
  accuracy: number,
  threshold: number
): Omit<Adaptation, "emphasisKey" | "temperatureKey"> | null {
  const gap = threshold - accuracy;

  if (accuracy < SEVERE_DROP) {
    return {
      market,
      newEmphasis: "conservative",
      newTemperature: CONSERVATIVE_TEMPERATURE,
      reason: `${market} accuracy ${(accuracy * 100).toFixed(1)}% is severely below threshold ${(threshold * 100).toFixed(1)}%`,
    };
  }

  if (accuracy < MODERATE_DROP) {
    return {
      market,
      newEmphasis: "conservative",
      newTemperature: DEFAULT_TEMPERATURE,
      reason: `${market} accuracy ${(accuracy * 100).toFixed(1)}% is below threshold ${(threshold * 100).toFixed(1)}% (gap: ${(gap * 100).toFixed(1)}%)`,
    };
  }

  // Mild drift — nudge to conservative but keep temperature
  return {
    market,
    newEmphasis: "conservative",
    newTemperature: DEFAULT_TEMPERATURE,
    reason: `${market} accuracy ${(accuracy * 100).toFixed(1)}% drifted below threshold ${(threshold * 100).toFixed(1)}%`,
  };
}

// ─── Safeguards ───────────────────────────────────────────

async function canCreateVersion(league: string): Promise<boolean> {
  const todayStart = moment().startOf("day").toDate();

  const todayVersions = await prisma.promptConfig.count({
    where: {
      league,
      createdAt: { gte: todayStart },
    },
  });

  if (todayVersions >= MAX_VERSIONS_PER_DAY) {
    logger.warn(`[PromptOptimizer] ${league}: Already ${todayVersions} version(s) created today — skipping.`);
    return false;
  }

  return true;
}

// ─── Main Optimizer ───────────────────────────────────────

export async function adaptPromptConfig(league: string): Promise<void> {
  try {
    const currentMonth = moment().format("YYYY-MM");

    // 1. Fetch recent drift signals for this league (current month)
    const driftSignals = await prisma.driftSignal.findMany({
      where: {
        league,
        month: currentMonth,
      },
      orderBy: { createdAt: "desc" },
    });

    if (driftSignals.length === 0) {
      logger.info(`[PromptOptimizer] ${league}: No drift signals — no adaptation needed.`);
      return;
    }

    // 2. Deduplicate signals per market (keep most recent)
    const latestByMarket = new Map<string, typeof driftSignals[0]>();
    for (const signal of driftSignals) {
      if (!latestByMarket.has(signal.market)) {
        latestByMarket.set(signal.market, signal);
      }
    }

    // 3. Determine adaptations
    const adaptations: Adaptation[] = [];
    for (const [market, signal] of latestByMarket) {
      const mapping = MARKET_TO_CONFIG[market];
      if (!mapping) continue;

      const result = determineAdaptation(market, signal.accuracy, signal.threshold);
      if (result) {
        adaptations.push({
          ...result,
          emphasisKey: mapping.emphasisKey,
          temperatureKey: mapping.temperatureKey,
        });
      }
    }

    if (adaptations.length === 0) {
      logger.info(`[PromptOptimizer] ${league}: Drift signals found but no adaptations needed.`);
      return;
    }

    // 4. Load current active config
    const currentConfig = await prisma.promptConfig.findFirst({
      where: { league, active: true },
      orderBy: { version: "desc" },
    });

    // 5. Build update — merge adaptations (deduplicate by emphasis key, last wins)
    const emphasisUpdates = new Map<MarketEmphasisKey, EmphasisLevel>();
    const temperatureUpdates = new Map<MarketTemperatureKey, number>();

    for (const a of adaptations) {
      const existing = emphasisUpdates.get(a.emphasisKey);
      // If multiple markets map to the same head (e.g. straight_win and draw both → winner),
      // prefer the more conservative setting
      if (!existing || a.newEmphasis === "conservative") {
        emphasisUpdates.set(a.emphasisKey, a.newEmphasis);
      }
      temperatureUpdates.set(a.temperatureKey, a.newTemperature);
    }

    // 6. Check if changes are actually different from current config
    if (currentConfig) {
      let hasChanges = false;
      for (const [key, value] of emphasisUpdates) {
        if (currentConfig[key] !== value) {
          hasChanges = true;
          break;
        }
      }
      if (!hasChanges) {
        for (const [key, value] of temperatureUpdates) {
          if (currentConfig[key] !== value) {
            hasChanges = true;
            break;
          }
        }
      }
      if (!hasChanges) {
        logger.info(`[PromptOptimizer] ${league}: Current config already reflects needed adaptations — skipping.`);
        return;
      }
    }

    // 7. Safeguard: check daily version limit
    if (!(await canCreateVersion(league))) {
      return;
    }

    // 8. Determine next version number
    const maxVersion = await prisma.promptConfig.findFirst({
      where: { league },
      orderBy: { version: "desc" },
      select: { version: true },
    });
    const nextVersion = (maxVersion?.version ?? 0) + 1;

    // 9. Deactivate current active config
    await prisma.promptConfig.updateMany({
      where: { league, active: true },
      data: { active: false },
    });

    // 10. Create new config version
    const baseConfig = currentConfig ?? {
      score_emphasis: "normal",
      winner_emphasis: "normal",
      btts_emphasis: "normal",
      goals_emphasis: "normal",
      score_temperature: DEFAULT_TEMPERATURE,
      winner_temperature: DEFAULT_TEMPERATURE,
      btts_temperature: DEFAULT_TEMPERATURE,
      goals_temperature: DEFAULT_TEMPERATURE,
      score_system_prompt: "",
      winner_system_prompt: "",
      btts_system_prompt: "",
      goals_system_prompt: "",
      global_preamble: "",
    };

    const newConfig = await prisma.promptConfig.create({
      data: {
        league,
        version: nextVersion,
        active: true,
        score_emphasis: emphasisUpdates.get("score_emphasis") ?? baseConfig.score_emphasis,
        winner_emphasis: emphasisUpdates.get("winner_emphasis") ?? baseConfig.winner_emphasis,
        btts_emphasis: emphasisUpdates.get("btts_emphasis") ?? baseConfig.btts_emphasis,
        goals_emphasis: emphasisUpdates.get("goals_emphasis") ?? baseConfig.goals_emphasis,
        score_temperature: temperatureUpdates.get("score_temperature") ?? baseConfig.score_temperature,
        winner_temperature: temperatureUpdates.get("winner_temperature") ?? baseConfig.winner_temperature,
        btts_temperature: temperatureUpdates.get("btts_temperature") ?? baseConfig.btts_temperature,
        goals_temperature: temperatureUpdates.get("goals_temperature") ?? baseConfig.goals_temperature,
        score_system_prompt: baseConfig.score_system_prompt,
        winner_system_prompt: baseConfig.winner_system_prompt,
        btts_system_prompt: baseConfig.btts_system_prompt,
        goals_system_prompt: baseConfig.goals_system_prompt,
        global_preamble: baseConfig.global_preamble,
      },
    });

    const reasons = adaptations.map((a) => a.reason).join("; ");
    logger.info(
      `[PromptOptimizer] ${league}: Created config v${nextVersion} (id=${newConfig.id}). Adaptations: ${reasons}`
    );
  } catch (error: any) {
    logger.error(`[PromptOptimizer] ${league}: Failed to adapt config: ${error.message}`);
  }
}
