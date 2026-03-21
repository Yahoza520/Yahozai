from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    birth_year: int
    gender: str | None = None

    @field_validator("birth_year")
    @classmethod
    def must_be_18(cls, v: int) -> int:
        from datetime import date
        age = date.today().year - v
        if age < 18:
            raise ValueError("18 yaşından küçükler kayıt olamaz")
        return v

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Şifre en az 8 karakter olmalı")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    plan: str
    gender: str | None
    denk_points: int
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
