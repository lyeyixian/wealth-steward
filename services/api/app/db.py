import os

from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

# Single source of truth for the connection string. The `+psycopg` driver works
# for both the app's async engine (here) and Alembic's sync engine (migrations/env.py).
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+psycopg://wealth:wealth@postgres:5432/wealth",
)

# Engine construction is lazy — no connection is opened until first use, so this
# is safe to import in tests without a live Postgres.
engine = create_async_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)
