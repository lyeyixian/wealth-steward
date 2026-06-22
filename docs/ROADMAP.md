# Roadmap

The design record is the ADRs (`docs/adr/`) and the glossary (`CONTEXT.md`). This file is the build sequence derived from them. The guiding principle: the AI agent is the product (ADR 0001), so every phase ships a working slice of the agent on real data.

## Phased capabilities

| Phase | Capability | Nature |
|---|---|---|
| **1 (MVP)** | Categorization agent loop | LLM + rules, evidence-based autonomy, tracing + eval from day 1 (ADR 0004) |
| **2** | Bill reminders, low-balance / cash-flow alerts, FIRE refresh + nudge | Deterministic — builds the alert surface + trust |
| **3** | Anomaly / unusual-transaction detection | LLM — tune against false positives |
| **4** | Spending insights / optimization | LLM — needs months of categorized data |
| **5** | Portfolio / rebalancing *proposals* (never execute, ADR 0003), predictive forecasting, **chat** orchestrating the jobs | Needs holdings + market price feed |

Open design branches not yet explored: **PDF statement AI extraction** (deferred from MVP), the **Phase-2 chat interface** details, and **FX gain/loss attribution** (deferred, per ADR 0008). Multi-currency is designed in ADR 0008.

## Stack (per ADRs 0002, 0005, 0006)

- **Actual Sync Server** (Node/Docker) — cash ledger system of record.
- **Ledger Service** (TS) — wraps official `@actual-app/api`, exposes a tailored internal API.
- **API / Agent** (Python) — PydanticAI Monitor + modular jobs + Wealth Layer logic; LiteLLM added later only if gateway features are needed.
- **Web** (React/TS) — dashboard + approval queue.
- **Postgres** — Wealth Layer + harness state (proposals, audit log, traces, eval data) and the job queue (`FOR UPDATE SKIP LOCKED`).
- **Langfuse** — tracing; **pydantic-evals** — offline eval/calibration.

## Repo structure (monorepo, plain dirs + docker-compose)

```
wealth-management-system/
├── CONTEXT.md, docs/adr/, docs/ROADMAP.md
├── docker-compose.yml          (actual-server · postgres · ledger · api · web)
├── services/
│   ├── ledger/   (TS — wraps @actual-app/api)
│   ├── api/      (Python — PydanticAI Monitor + jobs + wealth layer)
│   └── web/      (React/TS — frontend + approval queue)
└── evals/        (labeled datasets + offline eval scripts)
```

## MVP definition-of-done (Phase 1)

The categorization loop is done when:

1. A month of real transactions imports into Actual via the Ledger Service (CSV/OFX or SimpleFIN bank-sync).
2. The Monitor runs on import → Tier-0 Actual rules categorize known payees → PydanticAI categorizes the residue with category + confidence + rationale.
3. Evidence-based routing: rule match → auto-action; no rule → proposal queued (ADR 0004).
4. The proposal queue is reviewable in the web UI (approve / edit / reject); approval executes via the Ledger Service **and** writes an Actual rule (auto next time).
5. Every auto-action and approved proposal is in the Postgres audit log; undo works.
6. Every LLM decision is traced in Langfuse (inputs / prompt / output / confidence / rationale / cost).
7. An offline eval script runs the categorizer over a labeled set (seeded from corrections) and reports accuracy + calibration; re-runnable on prompt/model change.

**Proof:** the next month's import yields fewer proposals (it learned), and the eval script reports a real accuracy number.

## First 5 build steps

1. **Infra** — docker-compose (Actual server + Postgres); create a budget; empty DB schema; confirm login.
2. **Ledger Service (TS)** — wrap `@actual-app/api`: `getAccounts / getTransactions / addTransactions / updateTransaction / getRules / createRule` + health. Prove HTTP read/write to Actual.
3. **API skeleton (Python)** — FastAPI + Postgres (`proposals`, `audit_log`, `traces`, queue table); Langfuse wired; endpoint enqueues a categorize job.
4. **Categorization job** — PydanticAI agent: Tier-0 rules → LLM on residue → category+confidence+rationale; evidence-based routing → auto-action or proposal; write audit + trace.
5. **Approval UI + eval** — React proposal queue (approve/edit/reject → execute + create rule); offline eval script over a labeled set.
