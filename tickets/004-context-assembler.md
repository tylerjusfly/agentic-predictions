# TICKET-004: Build Context Assembler

**Priority:** Medium
**Tier:** Observe (Tier 1)
**Status:** TODO

## Summary

Create a Context Assembler that merges all input signals into a single enriched context object before the LLM sees anything.

## Requirements

- [ ] Merge inputs from:
  - `FootballScraper.ts` — PL + UCL fixtures and results (already exists)
  - Odds/stats API — market signals (e.g. The Odds API, free tier)
  - Team news feed — injuries, suspensions, confirmed lineups
- [ ] Integrate team name canonicalization (from Ticket-001) at this layer
- [ ] Inject past accuracy stats from agent memory into the context (depends on Ticket-007)
  - Example signal: *"Your BTTS predictions for UCL group stage games have been correct 41% of the time over the last 3 months."*
- [ ] Output a typed, enriched context object that downstream tiers consume

## Dependencies

- Ticket-001 (canonicalization)
- Ticket-007 (agent memory table — for accuracy injection)

## Notes

- This is the single source of truth for all data entering the prediction pipeline
- Accuracy history injection is the first feedback arrow in the closed loop
