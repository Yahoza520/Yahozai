from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "DENK API"
    DEBUG: bool = False

    DATABASE_URL: str = "postgresql+asyncpg://denk:denk@localhost:5432/denk"

    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 gün

    # CORS — production'da gerçek domain'i ver
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8080", "http://127.0.0.1:5500", "null"]

    # Sunucu URL (callback için)
    BASE_URL: str = "http://localhost:8000"

    # Iyzico
    IYZICO_API_KEY: str = ""
    IYZICO_SECRET_KEY: str = ""
    IYZICO_BASE_URL: str = "https://sandbox-api.iyzipay.com"  # prod: https://api.iyzipay.com

    # Premium fiyat (TRY)
    PREMIUM_PRICE: str = "30"

    # Konum kesişim parametreleri
    INTERSECTION_RADIUS_METERS: int = 100
    BASIC_LOOKBACK_HOURS: int = 24
    PREMIUM_LOOKBACK_HOURS: int = 72
    BASIC_DAILY_QUERY_LIMIT: int = 3

    # E-posta
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "DENK <noreply@denk.app>"

    model_config = {"env_file": ".env"}


settings = Settings()
