# Monitor harness: event + schedule into a job queue, modular jobs

The Monitor (the proactive agent) is structured as a shared harness over **modular jobs**:

- **Triggers** are both **event-driven** (statement imported, transaction added, threshold crossed) and **scheduled** (bill lookahead, monthly FIRE refresh, weekly anomaly sweep). Both feed a single **job queue** the Monitor consumes.
- **Each job** (categorize, anomaly-flag, bill-remind, FIRE-refresh, rebalancing-propose, …) is a discrete handler with its own trigger, prompt/tools, authority rules, and **eval set**, reusing the shared loop: *gather context → run → route output (auto-action / proposal / alert) → audit*.
- **Deterministic jobs skip the LLM entirely** (bill reminders, FIRE refresh, low-balance alerts are pure calculation). Only jobs that need judgement call a model.
- Adding a capability later is "emit a trigger + write a handler," and the **Phase-2 chat interface orchestrates over these same job tools** rather than being a separate agent.

## Why

Modular, independently-evaluable jobs fit the eval-first discipline of [[0004-evidence-based-categorization-autonomy]] — each job has its own ground-truth set and can be regression-tested in isolation. The rejected alternative, one general agent that reasons over everything on each wake, is more emergent but hard to eval, control, and debug, and its behavior drifts. The job-queue indirection (vs scheduled-only or event-only) cleanly supports both reactive and time-based work and is itself a worthwhile piece of harness engineering.

## Consequences

- Need a queue + scheduler + event bus as core infrastructure from early on.
- Per-job authority means the tiered-autonomy rules ([[0004-evidence-based-categorization-autonomy]]) are configured per job, not globally.
