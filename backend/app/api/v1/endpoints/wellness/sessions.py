from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.wellness import SessionCreate, SessionOut, TodaySessionsOut, StreakOut
from app.services.wellness_service import (
    get_wellness_user_by_anonymous_id,
    record_session,
    get_today_sessions,
    compute_streak,
)

router = APIRouter(prefix="/wellness/users/{anonymous_id}", tags=["wellness"])


async def _get_user_or_404(anonymous_id: str, db: AsyncSession):
    user = await get_wellness_user_by_anonymous_id(db, anonymous_id)
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    return user


@router.post("/sessions", response_model=SessionOut, status_code=201)
async def complete_session(
    anonymous_id: str,
    data: SessionCreate,
    db: AsyncSession = Depends(get_db),
):
    """Tamamlanan seans kaydını ekler (append-only)."""
    user = await _get_user_or_404(anonymous_id, db)
    session = await record_session(db, user, data)
    return session


@router.get("/sessions/today", response_model=TodaySessionsOut)
async def today_sessions(
    anonymous_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Bugün tamamlanan seansları ve toplam süreyi döner."""
    user = await _get_user_or_404(anonymous_id, db)
    sessions = await get_today_sessions(db, user)
    total = sum(s.duration_sec for s in sessions)
    return TodaySessionsOut(
        date=str(date.today()),
        completions=sessions,
        total_duration_sec=total,
    )


@router.get("/streak", response_model=StreakOut)
async def streak(
    anonymous_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Kullanıcının mevcut ardışık gün streak'ini döner."""
    user = await _get_user_or_404(anonymous_id, db)
    return await compute_streak(db, user)
