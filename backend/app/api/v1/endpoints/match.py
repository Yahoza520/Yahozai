from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.user import User
from app.models.match import Match, MatchStatus
from app.api.v1.deps import get_current_user
from app.schemas.match import LikeRequest, MatchOut

router = APIRouter(prefix="/match", tags=["match"])


@router.post("/like", status_code=201)
async def like_user(
    body: LikeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Bir kullanıcıyı beğen. Karşılıklıysa match oluşur."""
    if body.target_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Kendinizi beğenemezsiniz")

    # Hedef kullanıcı var mı?
    target = await db.get(User, body.target_user_id)
    if not target or not target.is_active:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

    # Mevcut match var mı?
    result = await db.execute(
        select(Match).where(
            or_(
                and_(Match.user_a_id == current_user.id, Match.user_b_id == body.target_user_id),
                and_(Match.user_a_id == body.target_user_id, Match.user_b_id == current_user.id),
            )
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        if existing.status == MatchStatus.matched:
            return {"message": "Zaten eşleştiniz", "matched": True}

        # Mevcut kullanıcının beğenisini kaydet
        if existing.user_a_id == current_user.id:
            existing.user_a_liked = True
        else:
            existing.user_b_liked = True

        if existing.user_a_liked and existing.user_b_liked:
            existing.status = MatchStatus.matched
            existing.matched_at = datetime.now(timezone.utc)
            await db.commit()
            return {"message": "Match oldu!", "matched": True}

        await db.commit()
        return {"message": "Beğeni gönderildi", "matched": False}

    # Yeni match kaydı oluştur
    a_id, b_id = current_user.id, body.target_user_id
    match = Match(user_a_id=a_id, user_b_id=b_id, user_a_liked=True, user_b_liked=False)
    db.add(match)
    await db.commit()
    return {"message": "Beğeni gönderildi", "matched": False}


@router.get("/list", response_model=list[MatchOut])
async def list_matches(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Kullanıcının tüm match'lerini listeler."""
    result = await db.execute(
        select(Match, User).join(
            User,
            or_(
                and_(Match.user_a_id == current_user.id, User.id == Match.user_b_id),
                and_(Match.user_b_id == current_user.id, User.id == Match.user_a_id),
            ),
        ).where(
            or_(Match.user_a_id == current_user.id, Match.user_b_id == current_user.id)
        )
    )
    rows = result.all()

    return [
        MatchOut(
            id=m.id,
            other_user_id=u.id,
            other_user_name=u.name,
            status=m.status.value,
            matched_at=m.matched_at,
        )
        for m, u in rows
    ]
