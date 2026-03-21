from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, timezone, timedelta
from math import radians, cos, sin, asin, sqrt
from app.core.database import get_db
from app.core.config import settings
from app.models.user import User, PlanType
from app.models.location_event import LocationEvent
from app.api.v1.deps import get_current_user
from app.schemas.location import LocationEventCreate, CandidateOut

router = APIRouter(prefix="/location", tags=["location"])


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """İki koordinat arası mesafeyi metre cinsinden döndürür."""
    R = 6371000
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return 2 * R * asin(sqrt(a))


@router.post("/event", status_code=201)
async def record_location(
    body: LocationEventCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Kullanıcının konum olayını kaydeder."""
    # Ghost mode kontrolü
    if current_user.ghost_mode_until and current_user.ghost_mode_until > datetime.now(timezone.utc):
        return {"message": "Ghost mode aktif, konum kaydedilmedi"}

    event = LocationEvent(
        user_id=current_user.id,
        latitude=body.latitude,
        longitude=body.longitude,
        recorded_at=body.recorded_at,
        note=body.note,
    )
    db.add(event)
    await db.commit()
    return {"message": "Konum kaydedildi"}


@router.get("/candidates", response_model=list[CandidateOut])
async def get_candidates(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Geçmişte kesişilen adayları döndürür (Time Travel)."""
    # Günlük sorgu limiti (Basic plan)
    if current_user.plan == PlanType.basic:
        now = datetime.now(timezone.utc)
        if current_user.daily_query_reset_at and current_user.daily_query_reset_at.date() < now.date():
            current_user.daily_query_count = 0
            current_user.daily_query_reset_at = now

        if current_user.daily_query_count >= settings.BASIC_DAILY_QUERY_LIMIT:
            raise HTTPException(status_code=429, detail="Günlük sorgu limitine ulaştın. Premium'a geç!")

        current_user.daily_query_count += 1
        current_user.daily_query_reset_at = current_user.daily_query_reset_at or datetime.now(timezone.utc)
        await db.commit()

    lookback_hours = (
        settings.PREMIUM_LOOKBACK_HOURS
        if current_user.plan == PlanType.premium
        else settings.BASIC_LOOKBACK_HOURS
    )
    since = datetime.now(timezone.utc) - timedelta(hours=lookback_hours)

    # Kullanıcının kendi eventleri
    my_events_result = await db.execute(
        select(LocationEvent).where(
            and_(LocationEvent.user_id == current_user.id, LocationEvent.recorded_at >= since)
        )
    )
    my_events = my_events_result.scalars().all()

    if not my_events:
        return []

    # Diğer kullanıcıların eventleri (aynı zaman diliminde)
    others_result = await db.execute(
        select(LocationEvent, User)
        .join(User, User.id == LocationEvent.user_id)
        .where(
            and_(
                LocationEvent.user_id != current_user.id,
                LocationEvent.recorded_at >= since,
                User.is_active == True,
            )
        )
    )
    others = others_result.all()

    candidates: dict[str, CandidateOut] = {}
    for my_event in my_events:
        for other_event, other_user in others:
            # Zaman farkı max 30 dakika
            time_diff = abs((my_event.recorded_at - other_event.recorded_at).total_seconds())
            if time_diff > 1800:
                continue

            dist = haversine(my_event.latitude, my_event.longitude, other_event.latitude, other_event.longitude)
            if dist <= settings.INTERSECTION_RADIUS_METERS:
                uid = other_user.id
                if uid not in candidates or candidates[uid].distance_meters > dist:
                    candidates[uid] = CandidateOut(
                        user_id=uid,
                        name=other_user.name,
                        intersection_at=other_event.recorded_at,
                        distance_meters=round(dist, 1),
                    )

    return list(candidates.values())
