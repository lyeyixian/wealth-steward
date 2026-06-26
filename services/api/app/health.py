from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine


async def check_postgres_reachable(engine: AsyncEngine) -> bool:
    """Confirm Postgres is reachable by issuing a trivial `SELECT 1`.

    This is the api's half of the walking-skeleton health thread: the api's
    health proves it can reach Postgres (issue #2).
    """
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
