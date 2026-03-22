import uuid
import json
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.config import settings
from app.models.user import User, PlanType
from app.models.subscription import Subscription
from app.api.v1.deps import get_current_user

router = APIRouter(prefix="/payment", tags=["payment"])

PREMIUM_DURATION_DAYS = 30


def _iyzico_options():
    return {
        "api_key": settings.IYZICO_API_KEY,
        "secret_key": settings.IYZICO_SECRET_KEY,
        "base_url": settings.IYZICO_BASE_URL,
    }


def _create_checkout_sync(conversation_id: str, user: User, callback_url: str) -> dict:
    import iyzipay
    name_parts = user.name.strip().split()
    first = name_parts[0]
    last = name_parts[-1] if len(name_parts) > 1 else "Kullanici"

    request_data = {
        "locale": "tr",
        "conversationId": conversation_id,
        "price": settings.PREMIUM_PRICE,
        "paidPrice": settings.PREMIUM_PRICE,
        "currency": "TRY",
        "basketId": f"premium_{user.id}",
        "paymentGroup": "SUBSCRIPTION",
        "callbackUrl": callback_url,
        "enabledInstallments": ["1"],
        "buyer": {
            "id": user.id,
            "name": first,
            "surname": last,
            "email": user.email,
            "identityNumber": "11111111111",
            "registrationAddress": "Istanbul, Turkiye",
            "ip": "127.0.0.1",
            "city": "Istanbul",
            "country": "Turkey",
        },
        "shippingAddress": {
            "contactName": user.name,
            "city": "Istanbul",
            "country": "Turkey",
            "address": "Istanbul, Turkiye",
        },
        "billingAddress": {
            "contactName": user.name,
            "city": "Istanbul",
            "country": "Turkey",
            "address": "Istanbul, Turkiye",
        },
        "basketItems": [
            {
                "id": "premium_monthly",
                "name": "DENK Premium - Aylik Abonelik",
                "category1": "Abonelik",
                "itemType": "VIRTUAL",
                "price": settings.PREMIUM_PRICE,
            }
        ],
    }

    result = iyzipay.CheckoutFormInitialize().create(request_data, _iyzico_options())
    raw = result.read().decode("utf-8")
    return json.loads(raw)


def _retrieve_checkout_sync(token: str, conversation_id: str) -> dict:
    import iyzipay
    request_data = {
        "locale": "tr",
        "conversationId": conversation_id,
        "token": token,
    }
    result = iyzipay.CheckoutForm().retrieve(request_data, _iyzico_options())
    raw = result.read().decode("utf-8")
    return json.loads(raw)


@router.post("/start")
async def start_payment(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Iyzico ödeme formu başlat — checkoutFormContent döner."""
    if not settings.IYZICO_API_KEY:
        raise HTTPException(status_code=503, detail="Ödeme sistemi henüz aktif değil")

    if current_user.plan == PlanType.premium:
        exp = current_user.premium_expires_at
        if exp and exp > datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Zaten Premium üyesiniz")

    conversation_id = f"denk_{current_user.id}_{int(datetime.now().timestamp())}"
    callback_url = f"{settings.BASE_URL}/api/v1/payment/callback"

    data = await run_in_threadpool(_create_checkout_sync, conversation_id, current_user, callback_url)

    if data.get("status") != "success":
        raise HTTPException(status_code=502, detail=data.get("errorMessage", "Iyzico hatası"))

    # Beklemedeki kaydı oluştur
    sub = Subscription(
        user_id=current_user.id,
        conversation_id=conversation_id,
        status="pending",
        amount=settings.PREMIUM_PRICE,
    )
    db.add(sub)
    await db.commit()

    return {
        "conversation_id": conversation_id,
        "checkout_form_content": data.get("checkoutFormContent"),
    }


@router.post("/callback")
async def payment_callback(request: Request, db: AsyncSession = Depends(get_db)):
    """Iyzico callback — ödeme sonucu işle."""
    form = await request.form()
    token = form.get("token")
    conversation_id = form.get("conversationId") or ""

    if not token:
        return HTMLResponse(_result_page("error", "Geçersiz ödeme oturumu"))

    # Subscription bul
    result = await db.execute(
        select(Subscription).where(Subscription.conversation_id == conversation_id)
    )
    sub = result.scalar_one_or_none()
    if not sub:
        # conversation_id form'da gelmeyebilir, token üzerinden doğrula
        sub_id = None
    else:
        sub_id = sub.id

    # Iyzico'ya doğrula
    data = await run_in_threadpool(_retrieve_checkout_sync, token, conversation_id or "verify")

    if data.get("status") != "success" or data.get("paymentStatus") != "SUCCESS":
        if sub:
            sub.status = "failed"
            await db.commit()
        return HTMLResponse(_result_page("fail", data.get("errorMessage", "Ödeme başarısız")))

    # Kullanıcıyı premium yap
    user_result = await db.execute(
        select(Subscription).where(Subscription.id == sub_id)
    )
    sub_refreshed = user_result.scalar_one_or_none() if sub_id else sub

    # Kullanıcıyı bul
    user = await db.get(User, sub.user_id) if sub else None
    if not user:
        # payment_id'den bul
        buyer_id = data.get("buyer", {}).get("id") if isinstance(data.get("buyer"), dict) else None
        if buyer_id:
            user = await db.get(User, buyer_id)

    if user:
        user.plan = PlanType.premium
        user.premium_expires_at = datetime.now(timezone.utc) + timedelta(days=PREMIUM_DURATION_DAYS)

    if sub:
        sub.status = "success"
        sub.iyzico_payment_id = str(data.get("paymentId", ""))
        sub.completed_at = datetime.now(timezone.utc)

    await db.commit()

    return HTMLResponse(_result_page("success", "Premium üyeliğiniz aktif edildi!"))


@router.get("/status")
async def payment_status(current_user: User = Depends(get_current_user)):
    """Kullanıcının premium durumunu döndür."""
    is_premium = (
        current_user.plan == PlanType.premium
        and current_user.premium_expires_at
        and current_user.premium_expires_at > datetime.now(timezone.utc)
    )
    return {
        "plan": current_user.plan.value,
        "is_premium": is_premium,
        "premium_expires_at": current_user.premium_expires_at,
    }


def _result_page(status: str, message: str) -> str:
    """Ödeme sonrası kullanıcıya gösterilecek sayfa."""
    if status == "success":
        icon, color, btn_text = "✓", "#3ecf8e", "Uygulamaya Dön"
        title = "Ödeme Başarılı!"
    elif status == "fail":
        icon, color, btn_text = "✗", "#fc5c5c", "Tekrar Dene"
        title = "Ödeme Başarısız"
    else:
        icon, color, btn_text = "!", "#f5c842", "Geri Dön"
        title = "Hata"

    return f"""<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DENK — Ödeme Sonucu</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{ font-family: 'Segoe UI', sans-serif; background: #080810; color: #e8e8f5;
           min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }}
    .card {{ background: #12121e; border: 1px solid #1e1e32; border-radius: 20px;
             padding: 40px 32px; max-width: 380px; width: 100%; text-align: center; }}
    .icon {{ width: 72px; height: 72px; border-radius: 50%; background: {color}22;
             border: 2px solid {color}; display: flex; align-items: center; justify-content: center;
             font-size: 2rem; color: {color}; margin: 0 auto 20px; }}
    h1 {{ font-size: 1.3rem; font-weight: 800; margin-bottom: 10px; }}
    p {{ font-size: 0.88rem; color: #9090c0; line-height: 1.5; margin-bottom: 24px; }}
    a {{ display: block; padding: 13px; background: {color}; color: #080810; font-weight: 700;
          border-radius: 10px; text-decoration: none; font-size: 0.95rem; }}
    .logo {{ font-size: 1.4rem; font-weight: 900; letter-spacing: -1px; margin-bottom: 28px;
              background: linear-gradient(135deg,#a78bfa,#fc5c8a); -webkit-background-clip: text;
              -webkit-text-fill-color: transparent; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">DENK</div>
    <div class="icon">{icon}</div>
    <h1>{title}</h1>
    <p>{message}</p>
    <a href="javascript:history.back()">← {btn_text}</a>
  </div>
</body>
</html>"""
