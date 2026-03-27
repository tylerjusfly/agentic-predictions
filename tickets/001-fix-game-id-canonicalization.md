# TICKET-001: Fix game_id Canonicalization

**Priority:** High
**Tier:** Observe (Tier 1)
**Status:** TODO

## Summary

Implement team name canonicalization so that `game_id` values are consistent across the system. This prevents data corruption and mismatches (e.g. `"Man City"` vs `"Manchester City"`).

## Requirements

- [ ] Create a `canonicalize()` utility that normalizes team names to a slug format (e.g. `"Man City"` -> `"manchester-city"`)
- [ ] Canonicalization lives in the Context Assembler layer, not in the scraper
- [ ] Update `game_id` generation to use canonical names: `${month}/${canonicalize(home_team)}-${canonicalize(away_team)}`
- [ ] Build a mapping table for known team name variants
- [ ] Backfill or migrate existing `game_id` values in the database to use canonical format

## Notes

- Highest ROI task — prevents data corruption with zero risk
- Must be done before any other work since downstream tasks depend on consistent IDs
- Fix the `getChampionsLeagues()` calling `api/public/premier-league` copy-paste bug while here
