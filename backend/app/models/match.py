import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Boolean, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
import enum


class MatchStatus(str, enum.Enum):
    pending = "pending"       # bir taraf beğendi
    matched = "matched"       # karşılıklı onay
    rejected = "rejected"


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_a_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    user_b_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    status: Mapped[MatchStatus] = mapped_column(SAEnum(MatchStatus), default=MatchStatus.pending)
    user_a_liked: Mapped[bool] = mapped_column(Boolean, default=False)
    user_b_liked: Mapped[bool] = mapped_column(Boolean, default=False)
    intersection_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    matched_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
