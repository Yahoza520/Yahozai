from pydantic import BaseModel
from datetime import datetime


class LikeRequest(BaseModel):
    target_user_id: str


class MatchOut(BaseModel):
    id: str
    other_user_id: str
    other_user_name: str
    status: str
    matched_at: datetime | None

    model_config = {"from_attributes": True}
