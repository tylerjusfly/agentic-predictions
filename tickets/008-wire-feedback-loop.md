# TICKET-008: Wire the Feedback Loop (Prompt Optimizer)

**Priority:** Low
**Tier:** Adapt (Tier 5)
**Status:** TODO

## Summary

Close the loop by building a prompt optimizer that reads drift signals from agent memory and automatically updates the prompt config. This is the final piece that makes the system self-improving.

## Requirements

- [ ] Build `adaptPromptConfig()` function that reads drift signals and updates prompt config:
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
- [ ] Wire the two feedback arrows:
  - **Accuracy history -> Context Assembler** — model sees its own past performance in the prompt
  - **Drift signals -> Prompt Builder** — strategy and template adjust automatically
- [ ] Run the optimizer in the same cron as the results ingester and stats engine
- [ ] Add safeguards so the optimizer can't make destructive changes (e.g. max version jumps per day)

## Dependencies

- Ticket-004 (context assembler)
- Ticket-005 (prompt builder with DB-stored config)
- Ticket-006 (drift detection signals)
- Ticket-007 (agent memory table)

## Notes

- This is the capstone task — all other tickets feed into this
- When BTTS accuracy drops, the optimizer can: increase few-shot examples, instruct conservatism, or temporarily disable that market
- Start with simple rules before adding more sophisticated adaptation logic
