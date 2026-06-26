from fastapi import Depends, FastAPI, Response

from .db import engine
from .health import check_postgres_reachable

app = FastAPI(title="Wealth Steward API", version="0.1.0")


async def postgres_reachable() -> bool:
    """Dependency wrapper so tests can override the DB probe without a live Postgres."""
    return await check_postgres_reachable(engine)


@app.get("/health")
async def health(response: Response, reachable: bool = Depends(postgres_reachable)):
    if reachable:
        return {"status": "ok", "postgres": "reachable"}
    response.status_code = 503
    return {"status": "degraded", "postgres": "unreachable"}
