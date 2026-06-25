import os

import asyncpg
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI(title="Wealth Steward API")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://wealth_steward:wealth_steward@localhost:5432/wealth_steward",
)


@app.get("/health")
async def health():
    try:
        conn = await asyncpg.connect(DATABASE_URL, timeout=5)
        await conn.execute("SELECT 1")
        await conn.close()
        return {"status": "ok", "checks": {"postgres": "reachable"}}
    except Exception as exc:
        return JSONResponse(
            status_code=503,
            content={
                "status": "degraded",
                "checks": {"postgres": "unreachable"},
                "error": str(exc),
            },
        )
