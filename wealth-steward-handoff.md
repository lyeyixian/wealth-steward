# Handoff — Wealth Steward (design session)

**Date:** 2026-06-22
**Project root:** `/Users/yixianlye/Documents/repo/wealth-management-system` (greenfield — no app code yet; only design docs)
**Next session goals:** (1) continue grilling the open design branches, (2) run `/to-prd` on the already-locked decisions to produce a PRD.

> The project was renamed mid-session to **Wealth Steward** (see `CONTEXT.md` line 1). Use that name.

## What this project is (one paragraph)

A single-user **wealth tracker for the Singapore/Malaysia context** whose centerpiece is a proactive AI agent ("the Monitor"). It is **AI-agent-first**: wealth management is the domain the agent operates on, not the thing to over-build. Cash data lives in a headless Actual Budget ledger; a separate "Wealth Layer" holds investments/loans/CPF-EPF/FIRE. The agent categorizes, monitors, and edits the user's records under a tiered-autonomy, human-in-the-loop authority model — and only ever **proposes** real-world money moves, never executes them.

## The design record (read these — do NOT duplicate them)

All decisions are already written down. A fresh agent should read these first:

- **`CONTEXT.md`** — full domain glossary (the ubiquitous language). 20+ terms pinned.
- **`docs/adr/0001`…`0008`** — the locked architectural decisions:
  - 0001 AI agent is the product; wealth mgmt is the domain
  - 0002 Actual Budget as headless ledger (split data model)
  - 0003 Tracker-only — agent proposes, never executes real money
  - 0004 Hybrid categorization, evidence-based autonomy (rules earn auto-apply, not LLM self-confidence)
  - 0005 Provider-agnostic via PydanticAI (LiteLLM later)
  - 0006 Hybrid polyglot: TS ledger service + Python AI backend
  - 0007 Monitor harness: event+schedule → job queue, modular jobs
  - 0008 Multi-currency: single base currency, time-correct FX (lock at snapshot; flows at txn-date rate)
- **`docs/ROADMAP.md`** — 5 phases, Postgres datastore, monorepo layout, **MVP definition-of-done**, **first 5 build steps**.

### Project memory (already saved, auto-loads next session)
`/Users/yixianlye/.claude/projects/-Users-yixianlye-Documents-repo-wealth-management-system/memory/`
- `user-language-profile.md` — stronger in TS, wants Python exposure, curious about Go; stack is partly a learning vehicle.
- `sg-my-financial-context.md` — CPF/EPF (not 401k), SGD/MYR, two-phase FIRE.

## Locked decisions a PRD can rely on (summary — authority is the ADRs above)

- **Goal priority:** AI-agent/portfolio learning wins ties over personal-tool and commercialization.
- **Stack:** Actual Sync Server (Node) · **TS Ledger Service** wrapping official `@actual-app/api` · **Python AI backend** (PydanticAI + pydantic-evals + Langfuse) · React/TS web · **Postgres** (wealth layer + harness state + job queue via SKIP LOCKED). Frontend React/TS regardless.
- **Model:** provider-agnostic; start Claude via PydanticAI; add LiteLLM proxy only if gateway features needed.
- **MVP (Phase 1):** the categorization agent loop — import → Tier-0 Actual rules → PydanticAI on residue (category+confidence+rationale) → evidence-based routing (rule→auto-action, else proposal) → approval queue UI → audit log + undo → Langfuse tracing day 1 → offline eval/calibration harness. PDF extraction is deferred.
- **Wealth figures defined precisely:** Net Worth vs Invested Capital (home excluded from the latter); Savings Rate = full-picture incl. employee+employer CPF/EPF; FIRE Number = two-phase (bridge + post-payout shortfall above CPF LIFE/EPF floor); Time to FIRE = projection. Holdings = position-level (no tax-lots, no CGT). Loans = full amortization.

## Open branches (where to resume grilling)

Not yet designed — clean entry points:
1. **PDF/statement AI extraction** — deferred Phase-2 AI feature (upload statement → Claude extracts transactions → dedupe → into ledger).
2. **Phase-2 chat interface** — reactive assistant orchestrating over the same Monitor job tools.
3. **FX gain/loss attribution** — deferred analytical feature (decompose net-worth change into FX vs contributions vs returns; ADR 0008).
4. Minor/unconfirmed: CPF/EPF contribution computation details (rate tables, wage ceilings, PR status); Phase 3+ job designs (anomaly detection approach, spending insights).

## How this session was run (so you can match the style)

- Skill used: **`grill-with-docs`** = run `/grilling` (one question at a time, always with a recommended answer) while using **`/domain-modeling`** to write `CONTEXT.md` + ADRs inline as decisions crystallize.
- Decisions were made via single-question `AskUserQuestion` cards with a "(Rec)" first option. The user steered actively — twice asked for research subagents (Actual Budget; agent frameworks across TS/Python/Go) before deciding, and corrected assumptions (no-CGT → dropped tax-lots; SG/MY → CPF/EPF reshaped savings rate + FIRE).
- ADRs offered sparingly (only hard-to-reverse + surprising + real-tradeoff). Glossary kept implementation-free.

## Suggested skills for the next session

- **`/to-prd`** — the user explicitly wants to convert the locked-in decisions (ADRs 0001–0008 + ROADMAP + CONTEXT) into a PRD. Feed it the design record above; focus the PRD on **Phase 1 (MVP)** since it has a definition-of-done and first build steps, and reference later phases as roadmap. (If `/to-prd` isn't installed, check available skills.)
- **`grill-with-docs`** (or **`grilling`** + **`domain-modeling`**) — to continue grilling the open branches above; keep appending ADRs/glossary terms the same way.
- When build starts: **`run`** / **`tdd`** for the first 5 build steps in ROADMAP.md (step 1 = docker-compose with Actual server + Postgres).

## Notes
- No secrets/credentials were introduced this session; nothing to redact.
- `git` is not initialized in the repo (`Is a git repository: false`). Consider `git init` before/when building.
