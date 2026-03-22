import random
import string
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, status, BackgroundTasks
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserOut, TokenOut
from pydantic import BaseModel

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/auth", tags=["auth"])


def _gen_code() -> str:
    return ''.join(random.choices(string.digits, k=6))


async def _send_code(user: User, background_tasks: BackgroundTasks) -> None:
    # Her zaman konsola yaz (geliştirme için)
    print(f"\n{'='*40}\n📧 Doğrulama Kodu | {user.email}\n🔑 KOD: {user.verification_code}\n{'='*40}\n")
    if settings.SMTP_USER:
        from app.core.email import send_verification_email
        background_tasks.add_task(send_verification_email, user.email, user.name, user.verification_code)


class VerifyRequest(BaseModel):
    email: str
    code: str


class ResendRequest(BaseModel):
    email: str


@router.post("/register", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, body: UserRegister, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    existing = result.scalar_one_or_none()

    code = _gen_code()
    expires = datetime.now(timezone.utc) + timedelta(minutes=10)

    if existing and not existing.is_verified:
        # Kodu yenile
        existing.verification_code = code
        existing.verification_expires_at = expires
        existing.hashed_password = hash_password(body.password)
        existing.name = body.name
        existing.birth_year = body.birth_year
        existing.terms_accepted_at = datetime.now(timezone.utc)
        await db.commit()
        await _send_code(existing, background_tasks)
        return {"message": "Doğrulama kodu gönderildi", "email": body.email, "needs_verification": True}

    if existing:
        raise HTTPException(status_code=400, detail="Bu e-posta zaten kayıtlı")

    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        name=body.name,
        birth_year=body.birth_year,
        gender=body.gender,
        is_verified=False,
        verification_code=code,
        verification_expires_at=expires,
        terms_accepted_at=datetime.now(timezone.utc),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    await _send_code(user, background_tasks)

    return {"message": "Doğrulama kodu gönderildi", "email": body.email, "needs_verification": True}


@router.post("/verify", response_model=TokenOut)
async def verify_email(body: VerifyRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Hesap zaten doğrulanmış")
    if not user.verification_code or user.verification_code != body.code:
        raise HTTPException(status_code=400, detail="Doğrulama kodu hatalı")
    if user.verification_expires_at and user.verification_expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Kod süresi dolmuş — yeniden kayıt ol")

    user.is_verified = True
    user.verification_code = None
    user.verification_expires_at = None
    await db.commit()
    await db.refresh(user)

    token = create_access_token(user.id)
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


@router.post("/resend-code")
@limiter.limit("3/minute")
async def resend_code(request: Request, body: ResendRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user or user.is_verified:
        raise HTTPException(status_code=400, detail="Geçersiz istek")

    user.verification_code = _gen_code()
    user.verification_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    await db.commit()
    await _send_code(user, background_tasks)

    return {"message": "Kod yeniden gönderildi"}


@router.post("/login", response_model=TokenOut)
@limiter.limit("10/minute")
async def login(request: Request, body: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Hesap askıya alınmış")
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="E-posta doğrulanmamış", headers={"X-Needs-Verification": "true"})

    token = create_access_token(user.id)
    return TokenOut(access_token=token, user=UserOut.model_validate(user))
