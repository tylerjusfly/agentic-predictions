# TICKET-003: Decouple Prediction Generation from GET Handler ( SKIP TICKET)

**Priority:** High
**Tier:** Act (Tier 3)
**Status:** TODO

## Summary

Move prediction generation out of the GET route and into a dedicated cron job. The GET endpoint should only read from the DB — it should never trigger an LLM call.

## Requirements

- [ ] Create a dedicated cron job / scheduled task for prediction generation
- [ ] Refactor the GET route to only query pre-generated predictions from Postgres
- [ ] Add Zod validation with retry logic before writing predictions to DB:
  ```ts
  const result = predictionSchema.safeParse(raw);
  if (!result.success) {
    // retry with explicit correction prompt
  }
  ```
- [ ] Use versioned prediction rows — never overwrite, always insert with a `version` counter
- [ ] Ensure the cron runs on a reliable schedule (before match days)

## Notes

- Versioned rows allow comparing prediction quality across prompt versions
- Keep the existing `public` vs `PRO` endpoint split — this change is internal only
- The retry-on-invalid-JSON pattern should attempt once with a corrected prompt before failing


