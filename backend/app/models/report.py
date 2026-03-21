import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Text, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
import enum


class ReportType(str, enum.Enum):
    spam = "spam"
    harassment = "harassment"
    fake_profile = "fake_profile"
    other = "other"


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    reporter_id: Mapped[str] = mapped_column(String, nullable=False)
    reported_id: Mapped[str] = mapped_column(String, nullable=False)
    report_type: Mapped[ReportType] = mapped_column(SAEnum(ReportType))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
