from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.wellness import ProgramCreate, ProgramOut
from app.services.wellness_service import (
    get_wellness_user_by_anonymous_id,
    get_active_program,
    upsert_program,
    decode_program,
)

router = APIRouter(prefix="/wellness/users/{anonymous_id}/program", tags=["wellness"])


async def _get_user_or_404(anonymous_id: str, db: AsyncSession):
    user = await get_wellness_user_by_anonymous_id(db, anonymous_id)
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    return user


@router.get("", response_model=ProgramOut)
async def get_program(
    anonymous_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Kullanıcının aktif programını şifresiz döner."""
    user = await _get_user_or_404(anonymous_id, db)
    program = await get_active_program(db, user)
    if not program:
        raise HTTPException(status_code=404, detail="Aktif program bulunamadı.")
    return decode_program(program)


@router.post("", response_model=ProgramOut, status_code=201)
async def save_program(
    anonymous_id: str,
    data: ProgramCreate,
    db: AsyncSession = Depends(get_db),
):
    """Program kaydeder; varsa eskiyi pasifleştirir (upsert)."""
    user = await _get_user_or_404(anonymous_id, db)
    program = await upsert_program(db, user, data)
    return decode_program(program)
