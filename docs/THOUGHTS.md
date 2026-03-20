# Closed-Loop Agent Architecture for Football Predictions

## What You're Building

A self-improving prediction system where the agent observes its own accuracy over time, uses that signal to tune future predictions, and operates autonomously on a schedule. The key difference from your current pipeline: **feedback flows back into the system**. Bad BTTS predictions in UCL group stage games change how the next prediction is generated.

---

## The Five-Tier Loop

```
Observe → Plan → Act → Evaluate → Adapt → (back to Observe)
```

---

## Tier 1 — Observe

Collect all signals before the LLM sees anything.

**Inputs:**
- `FootballScraper.ts` — PL + UCL fixtures and results (already exists)
- Odds/stats API — market signals (e.g. The Odds API, free tier available)
- Team news feed — injuries, suspensions, confirmed lineups

**Key component — Context Assembler:**

Merges all three inputs into a single enriched context object. This is also where **team name canonicalization lives** — not in the scraper. Every team name gets normalized before being used anywhere (e.g. `"Man City"` → `"manchester-city"`). This fixes the `game_id` mismatch problem at the root.

```ts
// game_id generation should use canonical names
const gameId = `${month}/${canonicalize(home_team)}-${canonicalize(away_team)}`;
```

The context assembler also **injects past accuracy stats** from agent memory, so the model receives a signal like: *"Your BTTS predictions for UCL group stage games have been correct 41% of the time over the last 3 months."*

---

## Tier 2 — Plan

Decide what kind of prediction to generate and how.

**Strategy selector** reads from agent memory and chooses which prediction heads to emphasize:
- Exact score
- Match winner
- BTTS (both teams to score)
- Over/under goals (2.5 and 3.5 thresholds)

Different strategies can run as parallel LLM calls with separate JSON schemas, then be merged. This replaces the current single-call approach.

**Prompt builder** assembles a chain-of-thought template with the schema injected. The template is not static — it's read from a config that the Adapt tier can update.

```ts
// Prompt config stored in DB, updated by the optimizer
const promptConfig = await prisma.promptConfig.findFirst({ where: { league, active: true } });
```

---

## Tier 3 — Act

The LLM prediction layer.

**Changes from current implementation:**

1. **Decouple from GET handler** — prediction generation moves into a dedicated cron job. The GET route reads from the DB; it never triggers an LLM call.

2. **Enrich the output schema** — add `confidence` and `reasoning` fields now, before you have thousands of rows:

```ts
const predictionSchema = z.object({
  home_score: z.number(),
  away_score: z.number(),
  winner: z.enum(["home", "away", "draw"]),
  btts: z.boolean(),
  over_two_five: z.boolean(),
  over_three_five: z.boolean(),
  confidence: z.number().min(0).max(1),   // NEW
  reasoning: z.string(),                  // NEW
});
```

3. **Zod validation with retry** — validate before writing to Postgres. On invalid JSON, retry once with a corrected prompt before failing.

```ts
const result = predictionSchema.safeParse(raw);
if (!result.success) {
  // retry with explicit correction prompt
}
```

**Prediction store** uses versioned rows — never overwrite, always insert with a `version` counter. This lets you compare prediction quality across prompt versions.

---

## Tier 4 — Evaluate

Score the predictions after results come in.

**Results ingester** (your existing `getResultsForPlayedGames.ts`) patches `actual_score` via cron. No changes needed here beyond making sure it runs reliably.

**Stats engine** extends your existing `predictionStats.ts` with:

| Metric | What it measures |
|--------|-----------------|
| Correct score | Exact scoreline match |
| Correct winner | Right outcome (home/draw/away) |
| BTTS accuracy | Both teams scored — correct? |
| Over/under accuracy | Goals threshold — correct? |
| **Brier score** | Calibration of confidence values |
| **Drift detector** | Rolling accuracy over last N games |

**Brier score** is the key addition. It measures whether your confidence values are calibrated — a prediction made with 0.8 confidence should be right roughly 80% of the time. Your current binary right/wrong tracking doesn't capture this.

```ts
// Brier score for a single prediction (lower = better)
const brier = (confidence - (correct ? 1 : 0)) ** 2;
```

**Drift detector** flags when accuracy on a specific market degrades over a rolling window:

```ts
const recentBttsAccuracy = games.slice(-20).filter(g => g.btts_correct).length / 20;
if (recentBttsAccuracy < DRIFT_THRESHOLD) {
  await flagDrift({ league, market: 'btts', accuracy: recentBttsAccuracy });
}
```

---

## Tier 5 — Adapt

Close the loop.

**Agent memory** stores per-league, per-market accuracy history. This is a new DB table:

```sql
CREATE TABLE agent_memory (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league      text NOT NULL,
  market      text NOT NULL,       -- 'winner', 'btts', 'score', etc.
  month       text NOT NULL,
  accuracy    float NOT NULL,
  brier_score float,
  sample_size int,
  created_at  timestamptz DEFAULT now()
);
```

**Prompt optimizer** reads drift signals and updates the prompt config. When BTTS accuracy in UCL drops below threshold, it can:
- Increase few-shot examples for BTTS reasoning
- Instruct the model to be more conservative on BTTS confidence
- Temporarily disable BTTS predictions until accuracy recovers

```ts
async function adaptPromptConfig(league: string, driftSignals: DriftSignal[]) {
  const updates: Partial<PromptConfig> = {};
  
  for (const signal of driftSignals) {
    if (signal.market === 'btts' && signal.accuracy < 0.45) {
      updates.btts_weight = 'conservative';
      updates.btts_examples = await getBestBttsExamples(league);
    }
  }
  
  await prisma.promptConfig.create({
    data: { league, ...updates, active: true, version: nextVersion }
  });
}
```

The two feedback arrows:
- **Accuracy history → Context Assembler** — the model sees its own past performance as part of the prompt
- **Drift signals → Prompt Builder** — the strategy and template adjust automatically

---

## Migration Path (recommended order)

1. **Fix `game_id` canonicalization** — highest ROI, prevents data corruption with zero risk
2. **Add `confidence` + `reasoning` to schema** — do this before generating more predictions
3. **Decouple prediction generation from GET** — move to a dedicated job
4. **Add Brier score to stats engine** — extends existing code
5. **Build agent memory table** — simple schema addition
6. **Wire the feedback loop** — context assembler reads memory, optimizer writes config

---

## Implementation Notes

- Keep the existing `public` vs `PRO` endpoint split — the closed-loop improvements are all internal
- The `getChampionsLeagues()` calling `api/public/premier-league` is likely a copy-paste bug — fix before adding UCL to the agent memory
- Use `moment().format("YYYY-MM")` consistently for `month` keys across all new tables
- Run the stats engine and optimizer in the same cron as the results ingester, triggered after `actual_score` is patched