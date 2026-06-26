# Design — Walking skeleton (infra + health thread)

Implements issue #2 (child of #1, the Phase-1 MVP PRD). The thinnest end-to-end
thread that proves the polyglot system (ADR 0006) stands up, with **no business
behavior yet**. This is the greenfield prefactor every later slice builds on: it
establishes the monorepo `services/` layout and the compose wiring so no later
slice has to.

## Services

| Service | Tech | Host port | Role |
|---|---|---|---|
| `actual-server` | `actualbudget/actual-server` | 5006 | Cash Ledger system of record (ADR 0002) |
| `postgres` | `postgres:16-alpine` | 5432 | Wealth Layer + harness state + job queue |
| `ledger` | TypeScript / Express | 3001 | Ledger Service — only thing that touches Actual (ADR 0006) |
| `api` | Python / FastAPI | 8000 | AI Backend — Monitor + jobs + Wealth Layer |
| `web` | React / Vite → nginx | 3000 | Dashboard + proposal queue |

Only `ledger`, `api`, and `web` are **owned** code; `actual-server` and
`postgres` are off-the-shelf images.

## Health thread

Each owned service exposes `GET /health`. The two backend probes prove the
cross-service wiring the issue asks for:

- **`ledger` → Actual.** `GET /health` issues an HTTP request to
  `ACTUAL_SERVER_URL`. Any non-5xx response (even a 404) proves the Actual
  engine is up and reachable → `200 {"status":"ok","actual":"reachable"}`. A
  network error or 5xx → `503 {"status":"degraded","actual":"unreachable"}`.
- **`api` → Postgres.** `GET /health` runs `SELECT 1` over the async SQLAlchemy
  engine → `200 {"status":"ok","postgres":"reachable"}`, else
  `503 {"status":"degraded","postgres":"unreachable"}`.
- **`web`.** `GET /health` is a static nginx `200 ok` — the web tier has no
  upstream to reach in the skeleton, so this is a pure liveness probe.

The reachability logic lives behind a seam in each backend so it is unit-tested
without live infra: `checkActualReachable(url, fetchFn)` (ledger,
`src/health.ts`) takes an injectable `fetch`; `check_postgres_reachable(engine)`
(api, `app/health.py`) is fronted by a FastAPI dependency the tests override.
Compose also defines container-level healthchecks that curl/wget each `/health`,
so `docker compose ps` reports the thread's status.

## Migrations

The api runs `alembic upgrade head` on container start (`entrypoint.sh`) before
uvicorn. The chain has a single empty baseline revision (`0001_initial`) — the
tooling is proven to run cleanly from empty, with **no domain tables yet**.
`migrations/env.py` reads the connection string from `DATABASE_URL` (the same
variable `app/db.py` uses); the `postgresql+psycopg` driver serves both the
app's async engine and Alembic's sync engine. Domain tables (`proposals`,
`audit_log`, `jobs`, `traces`) arrive in later MVP slices.

## First run

```sh
docker compose up --build
```

Then:

1. Open <http://localhost:5006> → set an Actual Budget password and **create a
   budget** (satisfies the "log into Actual and create a budget" criterion).
2. Verify the health thread:
   ```sh
   curl localhost:3001/health   # ledger → {"status":"ok","actual":"reachable"}
   curl localhost:8000/health   # api    → {"status":"ok","postgres":"reachable"}
   curl localhost:3000/health   # web    → ok
   ```
3. <http://localhost:3000> serves the placeholder web shell.

## Conventions established here

- **Monorepo layout:** owned code lives under `services/{ledger,api,web}`; evals
  land in `evals/` later (ROADMAP). Each service owns its Dockerfile and deps.
- **Config via environment**, with sane in-compose defaults; the `+psycopg` URL
  is shared by app and migrations.
- **Testable health seam** per backend — the template later jobs reuse: fake the
  external edge, assert the observable result.

## Deferred / not in this slice

- `@actual-app/api` wrapping and the real Ledger Service endpoints (next slice).
- Postgres domain schema, the job queue, Langfuse tracing, the categorize job.
- Pinning `actual-server` to a specific version tag (currently `latest`).
