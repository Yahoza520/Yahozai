from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


class WellnessUser(Base):
    """Anonim wellness kullanıcısı. PII içermez."""
    __tablename__ = "wellness_users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    anonymous_id = Column(String(64), unique=True, nullable=False, index=True)
    consent_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    programs = relationship("WellnessProgram", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("WellnessSession", back_populates="user", cascade="all, delete-orphan")
    referrals = relationship("ExpertReferral", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("WellnessAuditLog", back_populates="user", cascade="all, delete-orphan")


class WellnessProgram(Base):
    """Kullanıcının haftalık frekans programı. program_data AES-256 şifreli JSONB."""
    __tablename__ = "wellness_programs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("wellness_users.id", ondelete="CASCADE"), nullable=False)
    program_duration = Column(String(16), nullable=False)
    program_data = Column(Text, nullable=False)       # AES-256 şifreli JSON
    score_snapshot = Column(Text, nullable=True)      # AES-256 şifreli JSON
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("WellnessUser", back_populates="programs")


class WellnessSession(Base):
    """Tamamlanan seans kaydı. Append-only."""
    __tablename__ = "wellness_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("wellness_users.id", ondelete="CASCADE"), nullable=False)
    session_key = Column(String(128), nullable=False, index=True)
    completed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    duration_sec = Column(Integer, nullable=False)

    user = relationship("WellnessUser", back_populates="sessions")


class WellnessAuditLog(Base):
    """Append-only denetim kaydı. Hiçbir kayıt silinemez."""
    __tablename__ = "wellness_audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("wellness_users.id", ondelete="RESTRICT"), nullable=True)
    anonymous_user_id = Column(String(64), nullable=False, index=True)
    role = Column(String(32), nullable=False, default="VIEWER")
    action = Column(String(64), nullable=False)
    module = Column(String(64), nullable=False)
    resource_id = Column(String(128), nullable=True)
    status = Column(String(16), nullable=False)
    error_code = Column(String(64), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("WellnessUser", back_populates="audit_logs")


class ExpertReferral(Base):
    """Kardiyovasküler eşik aşıldığında oluşturulan uzman yönlendirme kaydı."""
    __tablename__ = "expert_referrals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("wellness_users.id", ondelete="CASCADE"), nullable=False)
    score_snapshot = Column(Text, nullable=False)     # AES-256 şifreli JSON
    kardiyovaskuler_score = Column(Integer, nullable=False)
    acknowledged = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("WellnessUser", back_populates="referrals")
