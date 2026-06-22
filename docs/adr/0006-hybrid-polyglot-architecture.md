# Hybrid polyglot architecture: TS ledger service + Python AI backend

The backend is split into two services across two languages:

- **TS Ledger Service (Node):** wraps Actual's **official** `@actual-app/api` engine in-process and exposes a tailored internal API (REST/gRPC) for the ledger operations the agent needs. It is the only thing that touches Actual.
- **Python AI Backend:** the product — the Monitor loop, categorization + confidence routing, proposals/approval queue, and the Wealth Layer logic. Built on PydanticAI ([[0005-provider-agnostic-models-via-pydanticai]]). It calls the Ledger Service over HTTP and owns the Wealth Layer store (Postgres/SQLite). The React/TS frontend talks to this backend.

Both still depend on the standard Actual Sync Server (Node/Docker), which the Ledger Service syncs with via Actual's CRDT protocol.

## Why hybrid over pure-Python (actualpy)

The pure-Python alternative (`actualpy`, an in-process community reimplementation) is simpler — one backend runtime, no internal API. We chose hybrid to get the **official, battle-tested Actual engine** instead of a community client that can lag or break on Actual upgrades. The cost is an extra service, an internal API contract to version, and cross-language debugging.

## Reversibility / migration path

The decision is deliberately reversible: the AI backend is unchanged either way. To fall back to pure-Python, swap the ledger call from an HTTP call to the TS service for an in-process `actualpy` call. So we may still **start pure-Python to ship faster and graduate to the hybrid if/when `actualpy` bites** — this ADR records hybrid as the intended end state.

## Consequences

- Polyglot repo (Python backend, TS ledger service, TS frontend) — more toolchains, but a clean service boundary is itself a portfolio positive.
- The agent's ledger "tool surface" is the Ledger Service's API, which we design — a chance to expose exactly what the agent needs, no more.
