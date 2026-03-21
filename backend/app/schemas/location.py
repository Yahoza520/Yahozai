from pydantic import BaseModel, field_validator
from datetime import datetime


class LocationEventCreate(BaseModel):
    latitude: float
    longitude: float
    recorded_at: datetime

    @field_validator("latitude")
    @classmethod
    def valid_lat(cls, v: float) -> float:
        if not (-90 <= v <= 90):
            raise ValueError("Geçersiz latitude")
        return v

    @field_validator("longitude")
    @classmethod
    def valid_lon(cls, v: float) -> float:
        if not (-180 <= v <= 180):
            raise ValueError("Geçersiz longitude")
        return v


class CandidateOut(BaseModel):
    user_id: str
    name: str
    intersection_at: datetime
    distance_meters: float
