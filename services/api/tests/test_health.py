from fastapi.testclient import TestClient

from app.main import app, postgres_reachable


def _stub_reachable(value: bool):
    async def _dep() -> bool:
        return value

    return _dep


def test_health_ok_when_postgres_reachable():
    app.dependency_overrides[postgres_reachable] = _stub_reachable(True)
    try:
        res = TestClient(app).get("/health")
        assert res.status_code == 200
        assert res.json() == {"status": "ok", "postgres": "reachable"}
    finally:
        app.dependency_overrides.clear()


def test_health_degraded_when_postgres_unreachable():
    app.dependency_overrides[postgres_reachable] = _stub_reachable(False)
    try:
        res = TestClient(app).get("/health")
        assert res.status_code == 503
        assert res.json() == {"status": "degraded", "postgres": "unreachable"}
    finally:
        app.dependency_overrides.clear()
