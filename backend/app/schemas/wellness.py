from pydantic import BaseModel, Field
from typing import Any, Optional
from datetime import datetime
import uuid


# ─── User ─────────────────────────────────────────────────────────────────────

class WellnessUserCreate(BaseModel):
    anonymous_id: str = Field(..., min_length=8, max_length=64)
    consent_date: datetime


class WellnessUserOut(BaseModel):
    id: uuid.UUID
    anonymous_id: str
    consent_date: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Program ──────────────────────────────────────────────────────────────────

class ProgramCreate(BaseModel):
    program_duration: str = Field(..., pattern="^(short|medium|full)$")
    program_data: dict[str, Any]       # Şifresiz JSON — servis şifreler
    score_snapshot: Optional[dict[str, Any]] = None


class ProgramOut(BaseModel):
    id: uuid.UUID
    program_duration: str
    program_data: dict[str, Any]       # Servis deşifreler
    score_snapshot: Optional[dict[str, Any]]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Session ──────────────────────────────────────────────────────────────────

class SessionCreate(BaseModel):
    session_key: str = Field(..., min_length=3, max_length=128)
    duration_sec: int = Field(..., ge=1, le=7200)


class SessionOut(BaseModel):
    id: uuid.UUID
    session_key: str
    completed_at: datetime
    duration_sec: int

    model_config = {"from_attributes": True}


class TodaySessionsOut(BaseModel):
    date: str
    completions: list[SessionOut]
    total_duration_sec: int


# ─── Streak ───────────────────────────────────────────────────────────────────

class StreakOut(BaseModel):
    count: int
    last_completed_date: Optional[str]


# ─── Audit Log ────────────────────────────────────────────────────────────────

class AuditLogCreate(BaseModel):
    anonymous_user_id: str = Field(..., min_length=4, max_length=64)
    role: str = Field(default="VIEWER", pattern="^(ADMIN|CLINICIAN|VIEWER)$")
    action: str = Field(..., min_length=3, max_length=64)
    module: str = Field(..., min_length=2, max_length=64)
    resource_id: Optional[str] = Field(default=None, max_length=128)
    status: str = Field(..., pattern="^(SUCCESS|FAILURE)$")
    error_code: Optional[str] = Field(default=None, max_length=64)


class AuditLogOut(BaseModel):
    id: uuid.UUID
    anonymous_user_id: str
    action: str
    module: str
    status: str
    timestamp: datetime

    model_config = {"from_attributes": True}


# ─── Expert Referral ──────────────────────────────────────────────────────────

class ReferralCreate(BaseModel):
    score_snapshot: dict[str, Any]
    kardiyovaskuler_score: int = Field(..., ge=0, le=20)


class ReferralOut(BaseModel):
    id: uuid.UUID
    kardiyovaskuler_score: int
    acknowledged: bool
    created_at: datetime

    model_config = {"from_attributes": True}
