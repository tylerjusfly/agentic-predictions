# TICKET-007: Build Agent Memory Table

**Priority:** Medium
**Tier:** Adapt (Tier 5)
**Status:** TODO

## Summary

Create a new `agent_memory` database table that stores per-league, per-market accuracy history. This is the foundation for the self-improving feedback loop.

## Requirements

- [ ] Create Prisma migration for the `agent_memory` table:
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
- [ ] Create a service/repository for reading and writing agent memory records
- [ ] Populate agent memory from stats engine output after each evaluation run
- [ ] Use `moment().format("YYYY-MM")` consistently for `month` keys

## Dependencies

- Ticket-006 (stats engine produces the accuracy + Brier data to store)

## Notes

- This table is read by the Context Assembler (Ticket-004) and the Prompt Optimizer (Ticket-008)
- Simple schema addition — no complex migrations needed
