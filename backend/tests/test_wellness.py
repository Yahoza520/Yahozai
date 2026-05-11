"""
Wellness API endpoint testleri.
pytest-asyncio + httpx AsyncClient kullanır.
DB yerine SQLite in-memory çalışır (test izolasyonu için).
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.models.wellness import WellnessUser  # noqa: F401 — tablo oluşturma için

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

engine_test = create_async_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSession = async_sessionmaker(engine_test, expire_on_commit=False)


async def override_get_db():
    async with TestSession() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


ANON_ID = "usr_test_abc123"
CONSENT = datetime.now(timezone.utc).isoformat()


# ─── Users ────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_register_user(client):
    resp = await client.post("/api/v1/wellness/users", json={
        "anonymous_id": ANON_ID,
        "consent_date": CONSENT,
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["anonymous_id"] == ANON_ID
    assert "id" in data


@pytest.mark.asyncio
async def test_register_duplicate_user_returns_409(client):
    payload = {"anonymous_id": ANON_ID, "consent_date": CONSENT}
    await client.post("/api/v1/wellness/users", json=payload)
    resp = await client.post("/api/v1/wellness/users", json=payload)
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_get_user(client):
    await client.post("/api/v1/wellness/users", json={
        "anonymous_id": ANON_ID, "consent_date": CONSENT
    })
    resp = await client.get(f"/api/v1/wellness/users/{ANON_ID}")
    assert resp.status_code == 200
    assert resp.json()["anonymous_id"] == ANON_ID


@pytest.mark.asyncio
async def test_get_unknown_user_returns_404(client):
    resp = await client.get("/api/v1/wellness/users/nonexistent")
    assert resp.status_code == 404


# ─── Programs ─────────────────────────────────────────────────────────────────

PROGRAM_PAYLOAD = {
    "program_duration": "medium",
    "program_data": {
        "weeklyPlan": {"monday": ["ENERGY_RESTORE.morning"]},
        "notes": ["Kulaklık kullanın."],
    },
    "score_snapshot": {"enerji": 5, "kardiyovaskuler": 2},
}


@pytest.mark.asyncio
async def test_save_and_get_program(client):
    await client.post("/api/v1/wellness/users", json={"anonymous_id": ANON_ID, "consent_date": CONSENT})
    save_resp = await client.post(f"/api/v1/wellness/users/{ANON_ID}/program", json=PROGRAM_PAYLOAD)
    assert save_resp.status_code == 201

    get_resp = await client.get(f"/api/v1/wellness/users/{ANON_ID}/program")
    assert get_resp.status_code == 200
    data = get_resp.json()
    assert data["program_duration"] == "medium"
    assert "monday" in data["program_data"]["weeklyPlan"]


@pytest.mark.asyncio
async def test_upsert_program_deactivates_old(client):
    await client.post("/api/v1/wellness/users", json={"anonymous_id": ANON_ID, "consent_date": CONSENT})
    await client.post(f"/api/v1/wellness/users/{ANON_ID}/program", json=PROGRAM_PAYLOAD)
    updated = {**PROGRAM_PAYLOAD, "program_duration": "full"}
    await client.post(f"/api/v1/wellness/users/{ANON_ID}/program", json=updated)
    get_resp = await client.get(f"/api/v1/wellness/users/{ANON_ID}/program")
    assert get_resp.json()["program_duration"] == "full"


@pytest.mark.asyncio
async def test_get_program_no_program_returns_404(client):
    await client.post("/api/v1/wellness/users", json={"anonymous_id": ANON_ID, "consent_date": CONSENT})
    resp = await client.get(f"/api/v1/wellness/users/{ANON_ID}/program")
    assert resp.status_code == 404


# ─── Sessions ─────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_complete_session(client):
    await client.post("/api/v1/wellness/users", json={"anonymous_id": ANON_ID, "consent_date": CONSENT})
    resp = await client.post(
        f"/api/v1/wellness/users/{ANON_ID}/sessions",
        json={"session_key": "ENERGY_RESTORE.morning", "duration_sec": 360},
    )
    assert resp.status_code == 201
    assert resp.json()["session_key"] == "ENERGY_RESTORE.morning"


@pytest.mark.asyncio
async def test_today_sessions(client):
    await client.post("/api/v1/wellness/users", json={"anonymous_id": ANON_ID, "consent_date": CONSENT})
    await client.post(f"/api/v1/wellness/users/{ANON_ID}/sessions",
                      json={"session_key": "NEURO_BALANCE.night", "duration_sec": 600})
    resp = await client.get(f"/api/v1/wellness/users/{ANON_ID}/sessions/today")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_duration_sec"] == 600
    assert len(data["completions"]) == 1


@pytest.mark.asyncio
async def test_streak_after_session(client):
    await client.post("/api/v1/wellness/users", json={"anonymous_id": ANON_ID, "consent_date": CONSENT})
    await client.post(f"/api/v1/wellness/users/{ANON_ID}/sessions",
                      json={"session_key": "A.morning", "duration_sec": 300})
    resp = await client.get(f"/api/v1/wellness/users/{ANON_ID}/streak")
    assert resp.status_code == 200
    assert resp.json()["count"] >= 1


# ─── Audit Log ────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_append_audit_log(client):
    resp = await client.post("/api/v1/wellness/audit", json={
        "anonymous_user_id": ANON_ID,
        "action": "KULLANICI_GIRIS",
        "module": "PrivacyConsentScreen",
        "status": "SUCCESS",
    })
    assert resp.status_code == 201
    assert resp.json()["action"] == "KULLANICI_GIRIS"


@pytest.mark.asyncio
async def test_audit_log_invalid_status(client):
    resp = await client.post("/api/v1/wellness/audit", json={
        "anonymous_user_id": ANON_ID,
        "action": "TEST",
        "module": "M",
        "status": "INVALID",
    })
    assert resp.status_code == 422


# ─── Expert Referral ──────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_create_referral(client):
    await client.post("/api/v1/wellness/users", json={"anonymous_id": ANON_ID, "consent_date": CONSENT})
    resp = await client.post(
        f"/api/v1/wellness/users/{ANON_ID}/referrals",
        json={"score_snapshot": {"kardiyovaskuler": 9}, "kardiyovaskuler_score": 9},
    )
    assert resp.status_code == 201
    assert resp.json()["kardiyovaskuler_score"] == 9


@pytest.mark.asyncio
async def test_referral_below_threshold_returns_400(client):
    await client.post("/api/v1/wellness/users", json={"anonymous_id": ANON_ID, "consent_date": CONSENT})
    resp = await client.post(
        f"/api/v1/wellness/users/{ANON_ID}/referrals",
        json={"score_snapshot": {"kardiyovaskuler": 5}, "kardiyovaskuler_score": 5},
    )
    assert resp.status_code == 400
