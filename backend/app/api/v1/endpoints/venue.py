from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone, timedelta
from app.core.database import get_db
from app.models.user import User
from app.models.location_event import LocationEvent
from app.api.v1.deps import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/venue", tags=["venue"])

# Pilot mekânlar
VENUES = {
    "SPOTTED-MODA-001": {"name": "Moda Cafe", "lat": 40.9876, "lon": 29.0289, "dp": 50},
    "SPOTTED-KADIFE-001": {"name": "Kadife Bar", "lat": 40.9901, "lon": 29.0225, "dp": 50},
}

QR_DAILY_LIMIT = 2
QR_COOLDOWN_HOURS = 2  # Aynı mekânda tekrar sayılma


class QRScanRequest(BaseModel):
    venue_code: str


@router.post("/qr-scan")
async def qr_scan(
    body: QRScanRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """QR tara → konum eventi kaydet + DP kazan."""
    venue = VENUES.get(body.venue_code)
    if not venue:
        raise HTTPException(status_code=404, detail="Geçersiz QR kodu")

    now = datetime.now(timezone.utc)
    cooldown_since = now - timedelta(hours=QR_COOLDOWN_HOURS)

    # Aynı mekânda son 2 saatte tarama yaptı mı?
    recent = await db.execute(
        select(LocationEvent).where(
            LocationEvent.user_id == current_user.id,
            LocationEvent.latitude == venue["lat"],
            LocationEvent.longitude == venue["lon"],
            LocationEvent.created_at >= cooldown_since,
        )
    )
    if recent.scalar_one_or_none():
        raise HTTPException(status_code=429, detail=f"Aynı mekânı en erken {QR_COOLDOWN_HOURS} saat sonra tekrar tarayabilirsin")

    # Konum eventi kaydet
    event = LocationEvent(
        user_id=current_user.id,
        latitude=venue["lat"],
        longitude=venue["lon"],
        recorded_at=now,
    )
    db.add(event)

    # DP ekle
    earned = venue["dp"]
    current_user.denk_points = (current_user.denk_points or 0) + earned
    await db.commit()

    return {
        "message": f"{venue['name']} doğrulandı!",
        "dp_earned": earned,
        "total_dp": current_user.denk_points,
        "venue": venue["name"],
    }
