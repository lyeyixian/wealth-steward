# Hybrid categorization with evidence-based autonomy

Categorization is **hybrid and self-improving**: Actual's deterministic rules categorize known payees for free (Tier 0); Claude categorizes only the uncovered residue, returning category + confidence + rationale (Tier 1). When the user corrects a categorization, the system writes a new Actual rule *and* retains the correction as a few-shot example — so the LLM's share of work, and the cost, shrink over time.

Auto-apply authority is grounded in **evidence, not LLM self-reported confidence**. In the MVP, the rule boundary IS the autonomy boundary: a matching rule → auto-action; no rule → the LLM result is queued as a proposal; on confirmation it becomes a rule and auto-applies thereafter. LLM self-confidence is not trusted to gate writes.

Later (Phase 2), we may allow high-confidence LLM categorizations to auto-apply *without* a rule — but only after building a calibration harness that measures whether reported confidence actually predicts correctness against the user's corrections (a reliability curve), and tuning a conservative threshold.

## Why

LLMs are frequently miscalibrated; auto-applying writes based on a self-reported "95% sure" risks silently corrupting the ledger. Grounding autonomy in demonstrated track record (rules earned through confirmation) is safe by construction and still highly automated after a short cold start. Treating calibration as a measured, later enhancement keeps the MVP safe while preserving a strong portfolio artifact.

## Consequences

- **Cold start:** early on, most residue transactions are proposals the user must confirm. This is a one-time cost that decays as rules accumulate.
- All auto-actions are logged and reversible regardless of tier.
- Phase 2 requires ground-truth correction data, which the MVP naturally collects.
