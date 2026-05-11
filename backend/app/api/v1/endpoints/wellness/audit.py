from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.wellness import AuditLogCreate, AuditLogOut
from app.services.wellness_service import (
    append_audit_log,
    get_wellness_user_by_anonymous_id,
)

router = APIRouter(prefix="/wellness/audit", tags=["wellness"])


@router.post("", response_model=AuditLogOut, status_code=status.HTTP_201_CREATED)
async def log_audit_event(
    data: AuditLogCreate,
    db: AsyncSession = Depends(get_db),
):
    """Denetim kaydı ekler. Append-only — hiçbir kayıt silinemez."""
    user = await get_wellness_user_by_anonymous_id(db, data.anonymous_user_id)
    log = await append_audit_log(db, data, user)
    return log
