from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "DENK API"
    DEBUG: bool = False

    DATABASE_URL: str = "postgresql+asyncpg://denk:denk@localhost:5432/denk"

    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 gün

    # Konum kesişim parametreleri
    INTERSECTION_RADIUS_METERS: int = 100
    BASIC_LOOKBACK_HOURS: int = 24
    PREMIUM_LOOKBACK_HOURS: int = 72
    BASIC_DAILY_QUERY_LIMIT: int = 3

    model_config = {"env_file": ".env"}


settings = Settings()
