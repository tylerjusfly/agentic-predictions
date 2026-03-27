# TICKET-006: Add Brier Score & Drift Detection to Stats Engine

**Priority:** Medium
**Tier:** Evaluate (Tier 4)
**Status:** TODO

## Summary

Extend the existing `predictionStats.ts` with Brier score calculation and a rolling accuracy drift detector.

## Requirements

- [ ] Add new metrics to the stats engine:

  | Metric | What it measures |
  |--------|-----------------|
  | Brier score | Calibration of confidence values |
  | Drift detector | Rolling accuracy over last N games |

- [ ] Implement Brier score:
  ```ts
  const brier = (confidence - (correct ? 1 : 0)) ** 2;
  ```
- [ ] Implement drift detector that flags degrading accuracy on a specific market over a rolling window:
  ```ts
  const recentBttsAccuracy = games.slice(-20).filter(g => g.btts_correct).length / 20;
  if (recentBttsAccuracy < DRIFT_THRESHOLD) {
    await flagDrift({ league, market: 'btts', accuracy: recentBttsAccuracy });
  }
  ```
- [ ] Define `DRIFT_THRESHOLD` constants per market
- [ ] Store drift signals for consumption by the Adapt tier

## Dependencies

- Ticket-002 (confidence field must exist in predictions)

## Notes

- Brier score measures whether confidence values are calibrated — a 0.8 confidence prediction should be right ~80% of the time
- Current binary right/wrong tracking doesn't capture calibration
- Run the stats engine in the same cron as the results ingester, triggered after `actual_score` is patched
