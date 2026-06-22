# Use Actual Budget as a headless ledger backbone

We run self-hosted Actual Budget (MIT-licensed) as the system of record for **cash-side data only** — transactions, cash/credit accounts, categories, payees, rules, statement import, bank-sync, and CRDT sync. Our own application reads and writes it through the official `@actual-app/api` Node SDK. We do **not** fork Actual's UI or rebuild its ledger.

This concentrates our engineering on the parts that are novel and align with the project's goal ([[0001-ai-agent-is-the-product]]): AI-based PDF/statement extraction (Actual cannot import PDFs), the wealth layer, and the agent. The community `actual-ai` project demonstrates LLM features working against this same API, de-risking the approach.

## Considered alternatives

- **Build our own ledger from scratch** — rejected for now: re-implements commodity machinery (import, dedupe, sync, bank-sync) and delays reaching the agent, the actual point of the project.
- **Fork and extend Actual's app** — rejected: large codebase to learn, ongoing rebase burden, and its envelope-budgeting philosophy fights our wealth/net-worth framing.

## Consequences

- **Split data model.** Actual owns the cash ledger; a separate store we own holds the wealth layer (position-level investment holdings, loans with amortization, CPF/EPF balances, FIRE scenarios, net-worth history) — concepts Actual cannot represent. Reconciling the two is our responsibility.
- **`@actual-app/api` is poll-based (no webhooks) and effectively single-writer per budget.** Fine for single-user; a known bottleneck if commercialization (multi-tenant) is ever pursued. Re-evaluate then.
- The agent's "tool surface" for cash operations is whatever the Actual API exposes.
