# Infra walking skeleton

Issue #2. Thinnest end-to-end thread proving the polyglot system stands up — no business behavior.

## Services

| Service | Image / Stack | Port | Purpose |
|---|---|---|---|
| actual-server | `actualbudget/actual-server:latest` | 5006 | Cash Ledger sync server — system of record |
| postgres | `postgres:16-alpine` | 5432 | Wealth Layer + harness state |
| ledger | TypeScript / Node 22 / Express | 3001 | Wraps `@actual-app/api`; internal API to Cash Ledger |
| api | Python 3.12 / FastAPI | 8000 | Monitor loop, proposals, Wealth Layer |
| web | React 18 / nginx | 3000 | Approval queue dashboard |

## Health checks

Each owned service exposes `GET /health`:

- **ledger** — pings `${ACTUAL_SERVER_URL}/health` over HTTP; `200` if reachable, `503` if not.
- **api** — executes `SELECT 1` against Postgres via asyncpg; `200` if reachable, `503` if not.
- **web** — nginx static `return 200 '{"status":"ok"}'`; always succeeds while the container is up.

## Migrations

Alembic is the migration tool (Python-native, SQLAlchemy-compatible). `entrypoint.sh` runs `alembic upgrade head` before starting uvicorn. `migrations/versions/0001_initial.py` is an empty placeholder — no domain tables yet. Schema evolves in the API skeleton slice.

## First-run: logging into Actual

`docker compose up` → visit `http://localhost:5006` → follow the Actual Budget setup wizard to set a password and create a budget. This password is local to the development volume and is not required by any service config at this stage.

## What's deferred to the next slice

- `@actual-app/api` integration: the ledger shell exists; the Actual SDK wrapping is slice 2 (Ledger Service TS).
- Domain tables: schema grows from slice 3 (API skeleton) onwards.
