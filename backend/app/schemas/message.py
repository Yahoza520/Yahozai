from pydantic import BaseModel, field_validator
from datetime import datetime


class MessageSend(BaseModel):
    content: str

    @field_validator("content")
    @classmethod
    def not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Mesaj boş olamaz")
        if len(v) > 2000:
            raise ValueError("Mesaj en fazla 2000 karakter olabilir")
        return v


class MessageOut(BaseModel):
    id: str
    match_id: str
    sender_id: str
    content: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationOut(BaseModel):
    match_id: str
    other_user_id: str
    other_user_name: str
    last_message: str | None
    last_message_at: datetime | None
    unread_count: int
