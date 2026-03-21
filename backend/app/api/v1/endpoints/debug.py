"""
Sadece DEBUG=true ortamında aktif olan test endpoint'leri.
Production'da bu router include edilmemeli.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone, timedelta
from app.core.database import get_db
from app.core.security import hash_password
from app.models.user import User, PlanType
from app.models.location_event import LocationEvent
from app.api.v1.deps import get_current_user

router = APIRouter(prefix="/debug", tags=["debug"])


@router.post("/reset-limits")
async def reset_limits(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Günlük sorgu limitini sıfırla."""
    current_user.daily_query_count = 0
    current_user.daily_query_reset_at = None
    await db.commit()
    return {"message": "Limit sıfırlandı", "daily_query_count": 0}


@router.post("/add-test-user")
async def add_test_user(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Mevcut kullanıcının son konumuna yakın bir test kullanıcısı oluştur.
    Eğer test kullanıcısı zaten varsa, sadece yeni konum eventi ekle.
    """
    # Son konumu al
    last_event_result = await db.execute(
        select(LocationEvent)
        .where(LocationEvent.user_id == current_user.id)
        .order_by(LocationEvent.created_at.desc())
        .limit(1)
    )
    last_event = last_event_result.scalar_one_or_none()

    if not last_event:
        raise HTTPException(status_code=400, detail="Önce bir konum kaydet")

    # Test kullanıcısı var mı?
    test_email = "test.nearby@denk.app"
    result = await db.execute(select(User).where(User.email == test_email))
    test_user = result.scalar_one_or_none()

    if not test_user:
        test_user = User(
            email=test_email,
            hashed_password=hash_password("denk1234"),
            name="Simülasyon Kullanıcısı",
            birth_year=1997,
            is_verified=True,
            plan=PlanType.basic,
        )
        db.add(test_user)
        await db.flush()

    # Aynı anda, 30-60m yakına konum ekle
    event = LocationEvent(
        user_id=test_user.id,
        latitude=last_event.latitude + 0.0003,   # ~33m fark
        longitude=last_event.longitude + 0.0003,
        recorded_at=last_event.recorded_at + timedelta(minutes=5),
    )
    db.add(event)
    await db.commit()

    return {
        "message": f"Test kullanıcısı '{test_user.name}' eklendi",
        "test_user_id": test_user.id,
        "near_location": {
            "latitude": event.latitude,
            "longitude": event.longitude,
            "recorded_at": event.recorded_at.isoformat(),
        }
    }


@router.post("/make-premium")
async def make_premium(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Test için hesabı Premium yap."""
    current_user.plan = PlanType.premium
    await db.commit()
    return {"message": "Hesap Premium yapıldı"}


@router.post("/add-dp")
async def add_dp(
    amount: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Test için DP ekle."""
    current_user.denk_points += amount
    await db.commit()
    return {"message": f"+{amount} DP eklendi", "total": current_user.denk_points}
