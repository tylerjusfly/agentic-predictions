# TICKET-002: Add confidence + reasoning to Prediction Schema

**Priority:** High
**Tier:** Act (Tier 3)
**Status:** TODO

## Summary

Extend the prediction output schema to include `confidence` (0-1 float) and `reasoning` (string) fields. This must happen before generating more predictions so historical data includes these fields.

## Requirements

- [ ] Update the Zod prediction schema:
  ```ts
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  ```
- [ ] Add `confidence` and `reasoning` columns to the predictions DB table (Prisma migration)
- [ ] Update the LLM prompt to request confidence and reasoning in its output
- [ ] Update any API responses or frontend components that consume predictions

## Notes

- Do this before generating more predictions so all future rows have these fields
- Confidence values are needed later for Brier score calculation (Ticket-006)
- Reasoning field helps with debugging and transparency
