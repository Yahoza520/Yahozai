from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.wellness import ReferralCreate, ReferralOut
from app.services.wellness_service import (
    get_wellness_user_by_anonymous_id,
    create_referral,
)

router = APIRouter(prefix="/wellness/users/{anonymous_id}/referrals", tags=["wellness"])


@router.post("", response_model=ReferralOut, status_code=status.HTTP_201_CREATED)
async def create_expert_referral(
    anonymous_id: str,
    data: ReferralCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Kardiyovasküler skoru eşiği aşan kullanıcı için uzman yönlendirme kaydı oluşturur.
    Skor snapshot AES-256 şifreli saklanır.
    """
    if data.kardiyovaskuler_score < 8:
        raise HTTPException(
            status_code=400,
            detail="Uzman yönlendirme yalnızca kardiyovasküler skor >= 8 için geçerlidir.",
        )
    user = await get_wellness_user_by_anonymous_id(db, anonymous_id)
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    referral = await create_referral(db, user, data)
    return referral
