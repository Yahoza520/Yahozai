from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.wellness import WellnessUserCreate, WellnessUserOut
from app.services.wellness_service import (
    create_wellness_user,
    get_wellness_user_by_anonymous_id,
)

router = APIRouter(prefix="/wellness/users", tags=["wellness"])


@router.post("", response_model=WellnessUserOut, status_code=status.HTTP_201_CREATED)
async def register_user(
    data: WellnessUserCreate,
    db: AsyncSession = Depends(get_db),
):
    """Anonim kullanıcı kaydı. anonymous_id daha önce kullanılmışsa 409 döner."""
    existing = await get_wellness_user_by_anonymous_id(db, data.anonymous_id)
    if existing:
        raise HTTPException(status_code=409, detail="Bu anonymous_id zaten kayıtlı.")
    user = await create_wellness_user(db, data)
    return user


@router.get("/{anonymous_id}", response_model=WellnessUserOut)
async def get_user(
    anonymous_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Kayıtlı kullanıcı bilgilerini döner."""
    user = await get_wellness_user_by_anonymous_id(db, anonymous_id)
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    return user
