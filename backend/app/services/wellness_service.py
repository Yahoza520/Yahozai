"""Wellness iş mantığı servisi — DB işlemleri burada."""
from datetime import date, datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.wellness import (
    WellnessUser,
    WellnessProgram,
    WellnessSession,
    WellnessAuditLog,
    ExpertReferral,
)
from app.schemas.wellness import (
    WellnessUserCreate,
    ProgramCreate,
    SessionCreate,
    AuditLogCreate,
    ReferralCreate,
    StreakOut,
)
from app.services.wellness_crypto import encrypt, decrypt


# ─── User ─────────────────────────────────────────────────────────────────────

async def create_wellness_user(
    db: AsyncSession, data: WellnessUserCreate
) -> WellnessUser:
    user = WellnessUser(
        anonymous_id=data.anonymous_id,
        consent_date=data.consent_date,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def get_wellness_user_by_anonymous_id(
    db: AsyncSession, anonymous_id: str
) -> Optional[WellnessUser]:
    result = await db.execute(
        select(WellnessUser).where(WellnessUser.anonymous_id == anonymous_id)
    )
    return result.scalar_one_or_none()


# ─── Program ──────────────────────────────────────────────────────────────────

async def upsert_program(
    db: AsyncSession, user: WellnessUser, data: ProgramCreate
) -> WellnessProgram:
    # Mevcut aktif programı pasife çek
    await db.execute(
        select(WellnessProgram)
        .where(and_(WellnessProgram.user_id == user.id, WellnessProgram.is_active == True))
    )
    existing = (await db.execute(
        select(WellnessProgram).where(
            and_(WellnessProgram.user_id == user.id, WellnessProgram.is_active == True)
        )
    )).scalar_one_or_none()

    if existing:
        existing.is_active = False

    program = WellnessProgram(
        user_id=user.id,
        program_duration=data.program_duration,
        program_data=encrypt(data.program_data),
        score_snapshot=encrypt(data.score_snapshot) if data.score_snapshot else None,
        is_active=True,
    )
    db.add(program)
    await db.commit()
    await db.refresh(program)
    return program


async def get_active_program(
    db: AsyncSession, user: WellnessUser
) -> Optional[WellnessProgram]:
    result = await db.execute(
        select(WellnessProgram).where(
            and_(WellnessProgram.user_id == user.id, WellnessProgram.is_active == True)
        )
    )
    return result.scalar_one_or_none()


def decode_program(program: WellnessProgram) -> dict:
    """Şifreli program_data ve score_snapshot'ı çözerek dict döner."""
    return {
        "id": str(program.id),
        "program_duration": program.program_duration,
        "program_data": decrypt(program.program_data),
        "score_snapshot": decrypt(program.score_snapshot) if program.score_snapshot else None,
        "is_active": program.is_active,
        "created_at": program.created_at,
    }


# ─── Sessions ─────────────────────────────────────────────────────────────────

async def record_session(
    db: AsyncSession, user: WellnessUser, data: SessionCreate
) -> WellnessSession:
    session = WellnessSession(
        user_id=user.id,
        session_key=data.session_key,
        duration_sec=data.duration_sec,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


async def get_today_sessions(
    db: AsyncSession, user: WellnessUser
) -> list[WellnessSession]:
    today_start = datetime.combine(date.today(), datetime.min.time()).replace(tzinfo=timezone.utc)
    result = await db.execute(
        select(WellnessSession).where(
            and_(
                WellnessSession.user_id == user.id,
                WellnessSession.completed_at >= today_start,
            )
        ).order_by(WellnessSession.completed_at)
    )
    return list(result.scalars().all())


# ─── Streak ───────────────────────────────────────────────────────────────────

async def compute_streak(db: AsyncSession, user: WellnessUser) -> StreakOut:
    """Son ardışık günleri sayar."""
    result = await db.execute(
        select(
            func.date(WellnessSession.completed_at).label("day")
        )
        .where(WellnessSession.user_id == user.id)
        .distinct()
        .order_by(func.date(WellnessSession.completed_at).desc())
    )
    days = [row.day for row in result]

    if not days:
        return StreakOut(count=0, last_completed_date=None)

    streak = 1
    last_date = days[0]
    for i in range(1, len(days)):
        delta = (days[i - 1] - days[i]).days
        if delta == 1:
            streak += 1
        else:
            break

    return StreakOut(
        count=streak,
        last_completed_date=str(last_date),
    )


# ─── Audit Log ────────────────────────────────────────────────────────────────

async def append_audit_log(
    db: AsyncSession,
    data: AuditLogCreate,
    user: Optional[WellnessUser] = None,
) -> WellnessAuditLog:
    log = WellnessAuditLog(
        user_id=user.id if user else None,
        anonymous_user_id=data.anonymous_user_id,
        role=data.role,
        action=data.action,
        module=data.module,
        resource_id=data.resource_id,
        status=data.status,
        error_code=data.error_code,
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log


# ─── Expert Referral ──────────────────────────────────────────────────────────

async def create_referral(
    db: AsyncSession, user: WellnessUser, data: ReferralCreate
) -> ExpertReferral:
    referral = ExpertReferral(
        user_id=user.id,
        score_snapshot=encrypt(data.score_snapshot),
        kardiyovaskuler_score=data.kardiyovaskuler_score,
    )
    db.add(referral)
    await db.commit()
    await db.refresh(referral)
    return referral
