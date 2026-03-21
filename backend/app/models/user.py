import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
import enum


class PlanType(str, enum.Enum):
    basic = "basic"
    premium = "premium"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    birth_year: Mapped[int] = mapped_column(nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    plan: Mapped[PlanType] = mapped_column(SAEnum(PlanType), default=PlanType.basic)
    ghost_mode_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    denk_points: Mapped[int] = mapped_column(default=0)
    daily_query_count: Mapped[int] = mapped_column(default=0)
    daily_query_reset_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    gender: Mapped[str | None] = mapped_column(String, nullable=True)
    verification_code: Mapped[str | None] = mapped_column(String, nullable=True)
    verification_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
