from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone, timedelta
from app.core.database import get_db
from app.models.user import User
from app.models.report import Report, ReportType
from app.api.v1.deps import get_current_user
from app.schemas.user import UserOut
from pydantic import BaseModel

router = APIRouter(prefix="/user", tags=["user"])

GHOST_MODE_DP_COST = 50


class ReportRequest(BaseModel):
    reported_id: str
    report_type: ReportType
    description: str | None = None


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


@router.post("/ghost-mode")
async def activate_ghost_mode(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """50 DP harcayarak 24 saatlik ghost mode aktif et."""
    if current_user.denk_points < GHOST_MODE_DP_COST:
        raise HTTPException(status_code=400, detail=f"Yetersiz DENK puanı. {GHOST_MODE_DP_COST} DP gerekiyor.")

    current_user.denk_points -= GHOST_MODE_DP_COST
    current_user.ghost_mode_until = datetime.now(timezone.utc) + timedelta(hours=24)
    await db.commit()
    return {"message": "Ghost mode 24 saat aktif", "ghost_mode_until": current_user.ghost_mode_until}


@router.post("/report", status_code=201)
async def report_user(
    body: ReportRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    target = await db.get(User, body.reported_id)
    if not target:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

    report = Report(
        reporter_id=current_user.id,
        reported_id=body.reported_id,
        report_type=body.report_type,
        description=body.description,
    )
    db.add(report)
    await db.commit()
    return {"message": "Şikayet alındı"}
