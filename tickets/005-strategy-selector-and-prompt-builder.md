# TICKET-005: Strategy Selector & Dynamic Prompt Builder

**Priority:** Medium
**Tier:** Plan (Tier 2)
**Status:** TODO

## Summary

Build a strategy selector that reads agent memory to decide which prediction heads to emphasize, and a dynamic prompt builder that assembles chain-of-thought templates from a DB-stored config.

## Requirements

- [ ] Strategy selector reads from agent memory and chooses which prediction heads to emphasize:
  - Exact score
  - Match winner
  - BTTS (both teams to score)
  - Over/under goals (2.5 and 3.5 thresholds)
- [ ] Support parallel LLM calls with separate JSON schemas per prediction head, then merge results
- [ ] Prompt builder assembles chain-of-thought template with schema injected
- [ ] Prompt config stored in DB, updatable by the Adapt tier:
  ```ts
  const promptConfig = await prisma.promptConfig.findFirst({ where: { league, active: true } });
  ```
- [ ] Create `PromptConfig` Prisma model with versioning

## Dependencies

- Ticket-007 (agent memory table)

## Notes

- This replaces the current single-call approach with a more modular system
- The prompt template is not static — the Adapt tier (Ticket-008) can update it
